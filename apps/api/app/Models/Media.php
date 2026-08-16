<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Media extends Model
{
    use HasFactory, HasUuids;

    protected $table = 'media';

    protected $fillable = [
        'filename',
        'disk',
        'path',
        'mime_type',
        'type',
        'caption',
        'size_bytes',
        'user_id',
        'custom_properties',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'custom_properties' => 'array',
    ];

    public static function detectType(?string $mimeType, ?string $filename = null): string
    {
        $mime = strtolower($mimeType ?? '');
        $ext = strtolower(pathinfo($filename ?? '', PATHINFO_EXTENSION));

        if (str_starts_with($mime, 'image/') || in_array($ext, ['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'])) {
            return 'image';
        }

        if (str_starts_with($mime, 'video/') || in_array($ext, ['mp4', 'webm', 'ogg', 'mov', 'avi', 'mkv'])) {
            return 'video';
        }

        if (str_starts_with($mime, 'audio/') || in_array($ext, ['mp3', 'wav', 'aac', 'flac', 'm4a'])) {
            return 'audio';
        }

        if (
            str_starts_with($mime, 'text/') ||
            str_contains($mime, 'pdf') ||
            str_contains($mime, 'word') ||
            str_contains($mime, 'excel') ||
            str_contains($mime, 'spreadsheet') ||
            str_contains($mime, 'presentation') ||
            in_array($ext, ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv', 'md'])
        ) {
            return 'document';
        }

        if (
            str_contains($mime, 'zip') ||
            str_contains($mime, 'compressed') ||
            str_contains($mime, 'tar') ||
            in_array($ext, ['zip', 'rar', 'tar', 'gz', '7z'])
        ) {
            return 'archive';
        }

        return 'other';
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function attachments()
    {
        return $this->hasMany(TaskAttachment::class, 'media_id');
    }

    public function getUrlAttribute(): string
    {
        return asset('storage/' . $this->path);
    }

    public function getIsImageAttribute(): bool
    {
        return $this->type === 'image' || str_starts_with($this->mime_type ?? '', 'image/');
    }

    public function getIsVideoAttribute(): bool
    {
        return $this->type === 'video' || str_starts_with($this->mime_type ?? '', 'video/');
    }

    public function getIsAudioAttribute(): bool
    {
        return $this->type === 'audio' || str_starts_with($this->mime_type ?? '', 'audio/');
    }

    public function getIsDocumentAttribute(): bool
    {
        return $this->type === 'document';
    }

    public function getIconAttribute(): string
    {
        return match ($this->type) {
            'image' => 'heroicon-o-photo',
            'video' => 'heroicon-o-video-camera',
            'audio' => 'heroicon-o-musical-note',
            'document' => 'heroicon-o-document-text',
            'archive' => 'heroicon-o-archive-box',
            default => 'heroicon-o-document',
        };
    }

    public function getTypeBadgeColorAttribute(): string
    {
        return match ($this->type) {
            'image' => 'success',
            'video' => 'info',
            'audio' => 'warning',
            'document' => 'primary',
            'archive' => 'danger',
            default => 'gray',
        };
    }
}
