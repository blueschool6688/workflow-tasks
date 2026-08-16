<?php

namespace App\Filament\Resources\TaskResource\RelationManagers;

use App\Models\Media;
use App\Models\TaskAttachment;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class AttachmentsRelationManager extends RelationManager
{
    protected static string $relationship = 'attachments';

    protected static ?string $recordTitleAttribute = 'filename';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\FileUpload::make('path')
                    ->disk('public')
                    ->directory('task-attachments')
                    ->preserveFilenames()
                    ->required()
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\ImageColumn::make('path')
                    ->disk('public')
                    ->square()
                    ->defaultImageUrl(url('https://cdn-icons-png.flaticon.com/512/3767/3767084.png'))
                    ->label('Thumbnail'),

                Tables\Columns\TextColumn::make('filename')
                    ->searchable()
                    ->sortable()
                    ->icon('heroicon-o-document-text'),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Uploaded By')
                    ->sortable(),

                Tables\Columns\TextColumn::make('size_bytes')
                    ->label('Size')
                    ->formatStateUsing(function ($state) {
                        if (! $state) return '-';
                        if ($state < 1024) return $state . ' B';
                        if ($state < 1048576) return round($state / 1024, 1) . ' KB';
                        return round($state / 1048576, 1) . ' MB';
                    }),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->headerActions([
                Action::make('selectFromMediaLibrary')
                    ->label('Chọn từ Thư viện Media')
                    ->icon('heroicon-o-folder-open')
                    ->color('primary')
                    ->form([
                        FormComponents\Select::make('media_id')
                            ->label('Select Media File')
                            ->options(function () {
                                return Media::latest()
                                    ->get()
                                    ->mapWithKeys(fn ($m) => [
                                        $m->id => $m->filename . ' (' . ($m->mime_type ?? 'file') . ' - ' . round(($m->size_bytes ?? 0) / 1024, 1) . 'KB)',
                                    ]);
                            })
                            ->required()
                            ->searchable()
                            ->preload(),
                    ])
                    ->action(function (array $data): void {
                        /** @var \App\Models\Task $task */
                        $task = $this->getOwnerRecord();
                        $media = Media::findOrFail($data['media_id']);

                        TaskAttachment::create([
                            'task_id' => $task->id,
                            'media_id' => $media->id,
                            'user_id' => auth()->id() ?? $media->user_id,
                            'filename' => $media->filename,
                            'disk' => $media->disk,
                            'path' => $media->path,
                            'mime_type' => $media->mime_type,
                            'size_bytes' => $media->size_bytes,
                        ]);
                    }),

                CreateAction::make('uploadNewFile')
                    ->label('Tải tệp mới')
                    ->icon('heroicon-o-arrow-up-tray')
                    ->color('success')
                    ->mutateFormDataUsing(function (array $data): array {
                        $userId = auth()->id();
                        $data['user_id'] = $userId;
                        if (! empty($data['path'])) {
                            $filename = basename($data['path']);
                            $fullPath = storage_path('app/public/' . $data['path']);
                            $size = file_exists($fullPath) ? filesize($fullPath) : null;
                            $mime = file_exists($fullPath) ? (mime_content_type($fullPath) ?: 'application/octet-stream') : null;

                            // Create central Media record
                            $media = Media::create([
                                'filename' => $filename,
                                'disk' => 'public',
                                'path' => $data['path'],
                                'mime_type' => $mime,
                                'type' => Media::detectType($mime, $filename),
                                'size_bytes' => $size,
                                'user_id' => $userId,
                            ]);

                            $data['media_id'] = $media->id;
                            $data['filename'] = $filename;
                            $data['disk'] = 'public';
                            $data['size_bytes'] = $size;
                            $data['mime_type'] = $mime;
                        }
                        return $data;
                    }),
            ])
            ->actions([
                DeleteAction::make(),
            ]);
    }
}
