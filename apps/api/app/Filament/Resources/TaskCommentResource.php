<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TaskCommentResource\Pages;
use App\Models\TaskComment;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TaskCommentResource extends Resource
{
    protected static ?string $model = TaskComment::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-chat-bubble-bottom-center-text';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.task_comments');
    }

    protected static ?int $navigationSort = 6;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Comment Details')
                    ->components([
                        FormComponents\Select::make('task_id')
                            ->relationship('task', 'title')
                            ->required()
                            ->disabled(),

                        FormComponents\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->required()
                            ->disabled(),

                        FormComponents\Textarea::make('body')
                            ->columnSpanFull()
                            ->disabled(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('task.task_number')
                    ->label('Task #')
                    ->badge()
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('task.title')
                    ->label('Task Title')
                    ->limit(30)
                    ->searchable(),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Author')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('body')
                    ->label('Comment')
                    ->limit(60)
                    ->searchable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->actions([
                ViewAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTaskComments::route('/'),
        ];
    }
}
