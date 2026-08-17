<?php

namespace App\Filament\Resources\OAuthTokenResource\Pages;

use App\Filament\Resources\OAuthTokenResource;
use App\Models\User;
use Filament\Actions\Action;
use Filament\Forms\Components as FormComponents;
use Filament\Notifications\Notification as FilamentNotification;
use Filament\Resources\Pages\ListRecords;
use Laravel\Passport\Passport;

class ListOAuthTokens extends ListRecords
{
    protected static string $resource = OAuthTokenResource::class;

    protected function getHeaderActions(): array
    {
        $scopes = collect(Passport::scopes())->mapWithKeys(fn ($scope) => [$scope->id => "{$scope->id} - {$scope->description}"])->toArray();
        $defaultScopes = is_array(Passport::$defaultScope) ? Passport::$defaultScope : (Passport::$defaultScope ? [Passport::$defaultScope] : []);

        return [
            Action::make('issue_token')
                ->label('Issue Token')
                ->icon('heroicon-o-plus-circle')
                ->modalHeading('Issue Personal Access Token')
                ->modalDescription('Generate a new OAuth Personal Access Token on behalf of a user with specific scopes.')
                ->modalSubmitActionLabel('Generate Token')
                ->form([
                    FormComponents\Select::make('user_id')
                        ->label('Select User')
                        ->options(User::all()->pluck('name', 'id'))
                        ->searchable()
                        ->required(),

                    FormComponents\TextInput::make('name')
                        ->label('Token Name / Description')
                        ->placeholder('e.g. CI Integration, Mobile App, API Client')
                        ->default('Personal Access Token')
                        ->required(),

                    FormComponents\CheckboxList::make('scopes')
                        ->label('Token Scopes')
                        ->options($scopes)
                        ->default($defaultScopes)
                        ->columns(2)
                        ->columnSpanFull(),

                    FormComponents\Select::make('expires_days')
                        ->label('Expiration Period')
                        ->options([
                            '30' => '30 Days',
                            '60' => '60 Days',
                            '90' => '90 Days',
                            '180' => '180 Days',
                            '365' => '1 Year',
                            '0' => 'Never Expire',
                        ])
                        ->default('90')
                        ->required(),
                ])
                ->action(function (array $data) {
                    $user = User::findOrFail($data['user_id']);
                    $tokenResult = $user->createToken($data['name'], $data['scopes'] ?? []);

                    if ((int) $data['expires_days'] > 0) {
                        $tokenResult->token->expires_at = now()->addDays((int) $data['expires_days']);
                        $tokenResult->token->save();
                    }

                    $plainToken = $tokenResult->accessToken;

                    FilamentNotification::make()
                        ->title('Token Generated Successfully!')
                        ->body("Bearer Token for {$user->name}:\n\n{$plainToken}\n\nMake sure to copy your personal access token now. You won't be able to see it again!")
                        ->warning()
                        ->persistent()
                        ->send();
                }),
        ];
    }
}
