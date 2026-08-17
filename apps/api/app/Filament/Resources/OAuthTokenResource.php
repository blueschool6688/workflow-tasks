<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OAuthTokenResource\Pages;
use App\Models\OAuthToken;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Notifications\Notification as FilamentNotification;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;
use Laravel\Passport\Passport;

class OAuthTokenResource extends Resource
{
    protected static ?string $model = OAuthToken::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-key';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.access_control');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.oauth_tokens');
    }

    protected static ?int $navigationSort = 3;

    public static function form(Schema $schema): Schema
    {
        $scopes = collect(Passport::scopes())->mapWithKeys(fn ($scope) => [$scope->id => "{$scope->id} - {$scope->description}"])->toArray();

        return $schema
            ->components([
                Components\Section::make('Token Details')
                    ->components([
                        FormComponents\TextInput::make('id')
                            ->label('Token ID')
                            ->disabled(),

                        FormComponents\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->label('User')
                            ->disabled(),

                        FormComponents\TextInput::make('name')
                            ->label('Token Name')
                            ->disabled(),

                        FormComponents\Select::make('client_id')
                            ->relationship('client', 'name')
                            ->label('OAuth Client')
                            ->disabled(),

                        FormComponents\CheckboxList::make('scopes')
                            ->options($scopes)
                            ->disabled()
                            ->columnSpanFull(),

                        FormComponents\Toggle::make('revoked')
                            ->label('Revoked')
                            ->disabled(),

                        FormComponents\DateTimePicker::make('expires_at')
                            ->label('Expires At')
                            ->disabled(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('id')
                    ->label('Token ID')
                    ->limit(12)
                    ->fontFamily('mono')
                    ->copyable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('User')
                    ->description(fn (OAuthToken $record): ?string => $record->user?->email)
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('name')
                    ->label('Token Name')
                    ->default('Personal Access Token')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('scopes')
                    ->label('Scopes')
                    ->badge()
                    ->separator(',')
                    ->color('info'),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->state(function (OAuthToken $record): string {
                        if ($record->revoked) {
                            return 'Revoked';
                        }
                        if ($record->expires_at && $record->expires_at->isPast()) {
                            return 'Expired';
                        }
                        return 'Active';
                    })
                    ->color(fn (string $state): string => match ($state) {
                        'Active' => 'success',
                        'Revoked' => 'danger',
                        'Expired' => 'gray',
                        default => 'secondary',
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('expires_at')
                    ->label('Expires At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('user')
                    ->relationship('user', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('revoked')
                    ->label('Revoked status'),
            ])
            ->actions([
                ViewAction::make(),

                Action::make('revoke')
                    ->label('Revoke')
                    ->icon('heroicon-o-no-symbol')
                    ->color('danger')
                    ->requiresConfirmation()
                    ->modalHeading('Revoke Access Token')
                    ->modalDescription('Are you sure you want to revoke this access token? The user or client will be immediately logged out and unable to make API requests.')
                    ->visible(fn (OAuthToken $record) => ! $record->revoked)
                    ->action(function (OAuthToken $record) {
                        $record->revoked = true;
                        $record->save();

                        FilamentNotification::make()
                            ->title('Token Revoked')
                            ->body("Token '{$record->name}' has been successfully revoked.")
                            ->success()
                            ->send();
                    }),

                Action::make('restore')
                    ->label('Activate')
                    ->icon('heroicon-o-check-circle')
                    ->color('success')
                    ->requiresConfirmation()
                    ->visible(fn (OAuthToken $record) => $record->revoked)
                    ->action(function (OAuthToken $record) {
                        $record->revoked = false;
                        $record->save();

                        FilamentNotification::make()
                            ->title('Token Activated')
                            ->body("Token '{$record->name}' is now active.")
                            ->success()
                            ->send();
                    }),

                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOAuthTokens::route('/'),
        ];
    }
}
