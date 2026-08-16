<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Organization extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'name',
        'slug',
        'domain',
        'logo',
        'settings',
    ];

    protected $casts = [
        'settings' => 'array',
    ];

    public function workspaces()
    {
        return $this->hasMany(Workspace::class);
    }
}
