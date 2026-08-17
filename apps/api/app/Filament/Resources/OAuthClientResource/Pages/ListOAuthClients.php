<?php

namespace App\Filament\Resources\OAuthClientResource\Pages;

use App\Filament\Resources\OAuthClientResource;
use Filament\Actions\Action;
use Filament\Forms\Components as FormComponents;
use Filament\Notifications\Notification as FilamentNotification;
use Filament\Resources\Pages\ListRecords;
use Laravel\Passport\ClientRepository;

class ListOAuthClients extends ListRecords
{
    protected static string $resource = OAuthClientResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Action::make('create_client')
                ->label('Create Client')
                ->icon('heroicon-o-plus-circle')
                ->modalHeading('Create OAuth Client')
                ->modalDescription('Register a new OAuth2 client application.')
                ->modalSubmitActionLabel('Create Client')
                ->form([
                    FormComponents\TextInput::make('name')
                        ->label('Client Name')
                        ->placeholder('e.g. Mobile App, Third-party Integration')
                        ->required(),

                    FormComponents\Select::make('client_type')
                        ->label('Client Type')
                        ->options([
                            'auth_code' => 'Authorization Code Grant Client',
                            'password' => 'Password Grant Client',
                            'personal' => 'Personal Access Client',
                        ])
                        ->default('auth_code')
                        ->required(),

                    FormComponents\TagsInput::make('redirect_uris')
                        ->label('Redirect URIs')
                        ->placeholder('Add Redirect URL (e.g. https://my-app.com/callback)')
                        ->default(['http://localhost/callback'])
                        ->columnSpanFull(),
                ])
                ->action(function (array $data) {
                    $clientRepo = app(ClientRepository::class);
                    $redirectUris = $data['redirect_uris'] ?? ['http://localhost/callback'];

                    if ($data['client_type'] === 'personal') {
                        $client = $clientRepo->createPersonalAccessGrantClient(
                            $data['name'],
                            'users'
                        );
                    } elseif ($data['client_type'] === 'password') {
                        $client = $clientRepo->createPasswordGrantClient(
                            $data['name'],
                            'users'
                        );
                    } else {
                        $client = $clientRepo->createAuthorizationCodeGrantClient(
                            $data['name'],
                            $redirectUris,
                            'users'
                        );
                    }

                    $secret = $client->plainSecret ?? $client->secret;

                    FilamentNotification::make()
                        ->title('OAuth Client Created!')
                        ->body("Client ID: {$client->id}\n\nClient Secret: {$secret}\n\nPlease copy and store the Secret safely.")
                        ->warning()
                        ->persistent()
                        ->send();
                }),
        ];
    }
}
