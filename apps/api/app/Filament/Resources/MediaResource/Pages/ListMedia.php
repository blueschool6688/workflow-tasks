<?php

namespace App\Filament\Resources\MediaResource\Pages;

use App\Filament\Resources\MediaResource;
use App\Models\Media;
use Filament\Actions\CreateAction;
use Filament\Schemas\Components\Tabs\Tab;
use Filament\Resources\Pages\ListRecords;
use Illuminate\Database\Eloquent\Builder;

class ListMedia extends ListRecords
{
    protected static string $resource = MediaResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make()
                ->mutateFormDataUsing(function (array $data): array {
                    $data['user_id'] = auth()->id();
                    if (! empty($data['path'])) {
                        $filename = basename($data['path']);
                        $data['filename'] = $filename;
                        $fullPath = storage_path('app/public/' . $data['path']);
                        if (file_exists($fullPath)) {
                            $data['size_bytes'] = filesize($fullPath);
                            $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
                            $data['mime_type'] = $mime;
                            $data['type'] = Media::detectType($mime, $filename);
                        }
                    }
                    return $data;
                }),
        ];
    }

    public function getTabs(): array
    {
        return [
            'all' => Tab::make('Tất cả / All Files')
                ->badge(Media::count()),

            'images' => Tab::make('Hình ảnh (Images)')
                ->icon('heroicon-o-photo')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'image'))
                ->badge(Media::where('type', 'image')->count()),

            'videos' => Tab::make('Video')
                ->icon('heroicon-o-video-camera')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'video'))
                ->badge(Media::where('type', 'video')->count()),

            'documents' => Tab::make('Tài liệu (Documents)')
                ->icon('heroicon-o-document-text')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'document'))
                ->badge(Media::where('type', 'document')->count()),

            'audio' => Tab::make('Âm thanh (Audio)')
                ->icon('heroicon-o-musical-note')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'audio'))
                ->badge(Media::where('type', 'audio')->count()),

            'archives' => Tab::make('Nén (Archives)')
                ->icon('heroicon-o-archive-box')
                ->modifyQueryUsing(fn (Builder $query) => $query->where('type', 'archive'))
                ->badge(Media::where('type', 'archive')->count()),
        ];
    }
}
