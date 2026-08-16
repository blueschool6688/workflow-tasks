<?php

namespace App\Filament\Resources;

use App\Filament\Resources\MediaResource\Pages;
use App\Models\Media;
use Filament\Actions\Action;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\Resource;
use Filament\Schemas\Components;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;
use Illuminate\Support\HtmlString;

class MediaResource extends Resource
{
    protected static ?string $model = Media::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-folder-open';

    protected static ?int $navigationSort = 3;

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.organization');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.media') ?: 'Media Library';
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Upload Media Files')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\FileUpload::make('path')
                            ->disk('public')
                            ->directory('media-library')
                            ->preserveFilenames()
                            ->required()
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('caption')
                            ->placeholder('Optional caption or description...')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
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
                    ->wrap(),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->colors([
                        'success' => 'image',
                        'info' => 'video',
                        'warning' => 'audio',
                        'primary' => 'document',
                        'danger' => 'archive',
                        'gray' => 'other',
                    ])
                    ->formatStateUsing(fn ($state) => strtoupper($state))
                    ->sortable(),

                Tables\Columns\TextColumn::make('mime_type')
                    ->badge()
                    ->color('gray')
                    ->sortable(),

                Tables\Columns\TextColumn::make('size_bytes')
                    ->label('Size')
                    ->formatStateUsing(function ($state) {
                        if (! $state) return '-';
                        if ($state < 1024) return $state . ' B';
                        if ($state < 1048576) return round($state / 1024, 1) . ' KB';
                        if ($state < 1073741824) return round($state / 1048576, 1) . ' MB';
                        return round($state / 1073741824, 2) . ' GB';
                    })
                    ->sortable(),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Uploaded By')
                    ->default('System')
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'image' => 'Images (Photo / SVG / WebP)',
                        'video' => 'Videos (MP4 / WebM / MOV)',
                        'document' => 'Documents (PDF / Word / TXT / CSV)',
                        'audio' => 'Audio (MP3 / WAV / OGG)',
                        'archive' => 'Archives (ZIP / RAR / TAR)',
                        'other' => 'Other Files',
                    ]),
            ])
            // ->headerActions([
            //     CreateAction::make()
            //         ->mutateFormDataUsing(function (array $data): array {
            //             $data['user_id'] = auth()->id();
            //             if (! empty($data['path'])) {
            //                 $filename = basename($data['path']);
            //                 $data['filename'] = $filename;
            //                 $fullPath = storage_path('app/public/' . $data['path']);
            //                 if (file_exists($fullPath)) {
            //                     $data['size_bytes'] = filesize($fullPath);
            //                     $mime = mime_content_type($fullPath) ?: 'application/octet-stream';
            //                     $data['mime_type'] = $mime;
            //                     $data['type'] = Media::detectType($mime, $filename);
            //                 }
            //             }
            //             return $data;
            //         }),
            // ])
            ->actions([
                Action::make('preview')
                    ->label('Preview / Play')
                    ->icon('heroicon-o-eye')
                    ->color('info')
                    ->modalHeading(fn (Media $record) => 'Preview: ' . $record->filename)
                    ->modalContent(function (Media $record) {
                        $url = asset('storage/' . $record->path);
                        if ($record->is_image) {
                            return new HtmlString('<div class="flex justify-center p-4"><img src="' . e($url) . '" class="max-h-[500px] rounded-lg shadow-lg" alt="' . e($record->filename) . '"/></div>');
                        }
                        if ($record->is_video) {
                            return new HtmlString('<div class="flex justify-center p-4"><video controls class="w-full max-h-[500px] rounded-lg shadow-lg"><source src="' . e($url) . '" type="' . e($record->mime_type) . '">Your browser does not support video playback.</video></div>');
                        }
                        if ($record->is_audio) {
                            return new HtmlString('<div class="flex flex-col items-center justify-center p-6 gap-4"><div class="text-lg font-semibold">' . e($record->filename) . '</div><audio controls class="w-full"><source src="' . e($url) . '" type="' . e($record->mime_type) . '">Your browser does not support audio playback.</audio></div>');
                        }
                        return new HtmlString('<div class="p-6 text-center"><p class="text-sm text-gray-500 mb-4">File preview not available directly for this format.</p><a href="' . e($url) . '" target="_blank" class="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700">Download / Open File</a></div>');
                    }),
                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListMedia::route('/'),
        ];
    }
}
