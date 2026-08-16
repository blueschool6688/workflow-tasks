<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProjectMessage extends Model
{
    use HasFactory, HasUuids;

    protected $fillable = [
        'project_id',
        'user_id',
        'content',
        'attachments',
        'reply_to_id',
        'is_system',
        'is_pinned',
        'pinned_at',
        'pinned_by_id',
    ];

    protected $casts = [
        'sequence_id' => 'integer',
        'attachments' => 'array',
        'is_system' => 'boolean',
        'is_pinned' => 'boolean',
        'pinned_at' => 'datetime',
    ];

    protected static function booted(): void
    {
        static::creating(function (ProjectMessage $message) {
            if (empty($message->sequence_id)) {
                $driver = $message->getConnection()->getDriverName();
                if ($driver === 'sqlite') {
                    $maxSeq = (int) (static::query()->max('sequence_id') ?? 0);
                    $message->sequence_id = $maxSeq + 1;
                }
            }
        });
    }

    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function pinnedBy()
    {
        return $this->belongsTo(User::class, 'pinned_by_id');
    }

    public function replyTo()
    {
        return $this->belongsTo(ProjectMessage::class, 'reply_to_id');
    }
}
