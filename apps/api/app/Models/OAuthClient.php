<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;
use Laravel\Passport\Client as PassportClient;

class OAuthClient extends PassportClient
{
    protected $table = 'oauth_clients';

    protected $casts = [
        'grant_types' => 'array',
        'redirect_uris' => 'array',
        'revoked' => 'boolean',
    ];

    public function tokens(): HasMany
    {
        return $this->hasMany(OAuthToken::class, 'client_id');
    }
}
