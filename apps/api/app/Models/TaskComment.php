<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskComment extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'task_id',
        'user_id',
        'body',
    ];

    protected $appends = ['content'];

    public function getContentAttribute(): string
    {
        return $this->body ?? '';
    }

    public function setContentAttribute($value): void
    {
        $this->attributes['body'] = $value;
    }

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
