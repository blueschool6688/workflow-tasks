<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Laravel\Passport\Token as PassportToken;

class OAuthToken extends PassportToken
{
    protected $table = 'oauth_access_tokens';

    protected $casts = [
        'scopes' => 'array',
        'revoked' => 'boolean',
        'expires_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(OAuthClient::class, 'client_id');
    }

    public function getIsExpiredAttribute(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function getStatusAttribute(): string
    {
        if ($this->revoked) {
            return 'revoked';
        }
        if ($this->is_expired) {
            return 'expired';
        }
        return 'active';
    }
}
