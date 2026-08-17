<?php

namespace App\Filament\Resources;

use App\Filament\Resources\OAuthClientResource\Pages;
use App\Models\OAuthClient;
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
use Illuminate\Support\Str;

class OAuthClientResource extends Resource
{
    protected static ?string $model = OAuthClient::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-server-stack';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.access_control');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.oauth_clients');
    }

    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Client Information')
                    ->components([
                        FormComponents\TextInput::make('name')
                            ->label('Client Name')
                            ->required()
                            ->maxLength(255),

                        FormComponents\TextInput::make('provider')
                            ->label('Provider')
                            ->default('users')
                            ->required(),

                        FormComponents\TagsInput::make('redirect_uris')
                            ->label('Redirect URIs')
                            ->placeholder('Add Redirect URL (e.g. https://my-app.com/callback)')
                            ->columnSpanFull(),

                        FormComponents\Toggle::make('revoked')
                            ->label('Revoked'),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->label('Client Name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('id')
                    ->label('Client ID')
                    ->fontFamily('mono')
                    ->limit(18)
                    ->copyable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('provider')
                    ->label('Provider')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('status')
                    ->label('Status')
                    ->badge()
                    ->state(fn (OAuthClient $record): string => $record->revoked ? 'Revoked' : 'Active')
                    ->color(fn (string $state): string => $state === 'Active' ? 'success' : 'danger'),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\TernaryFilter::make('revoked')
                    ->label('Revoked status'),
            ])
            ->actions([
                ViewAction::make(),

                Action::make('regenerate_secret')
                    ->label('Regenerate Secret')
                    ->icon('heroicon-o-arrow-path')
                    ->color('warning')
                    ->requiresConfirmation()
                    ->modalHeading('Regenerate Client Secret')
                    ->modalDescription('Are you sure you want to regenerate the secret for this client? Any existing integrations using the old secret will fail.')
                    ->action(function (OAuthClient $record) {
                        $newSecret = Str::random(40);
                        $record->secret = $newSecret;
                        $record->save();

                        FilamentNotification::make()
                            ->title('Client Secret Regenerated!')
                            ->body("New Secret for '{$record->name}':\n\n{$newSecret}\n\nMake sure to update your application config with this new secret.")
                            ->warning()
                            ->persistent()
                            ->send();
                    }),

                Action::make('toggle_revoke')
                    ->label(fn (OAuthClient $record) => $record->revoked ? 'Activate' : 'Revoke')
                    ->icon(fn (OAuthClient $record) => $record->revoked ? 'heroicon-o-check-circle' : 'heroicon-o-no-symbol')
                    ->color(fn (OAuthClient $record) => $record->revoked ? 'success' : 'danger')
                    ->requiresConfirmation()
                    ->action(function (OAuthClient $record) {
                        $record->revoked = ! $record->revoked;
                        $record->save();

                        $status = $record->revoked ? 'revoked' : 'activated';

                        FilamentNotification::make()
                            ->title("Client {$status}")
                            ->body("Client '{$record->name}' has been {$status}.")
                            ->success()
                            ->send();
                    }),

                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListOAuthClients::route('/'),
        ];
    }
}
