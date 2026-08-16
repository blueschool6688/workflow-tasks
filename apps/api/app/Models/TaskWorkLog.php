<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TaskWorkLog extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'task_id',
        'user_id',
        'action',
        'minutes_logged',
        'note',
        'logged_at',
    ];

    protected $casts = [
        'logged_at' => 'datetime',
        'minutes_logged' => 'integer',
    ];

    public function task()
    {
        return $this->belongsTo(Task::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
