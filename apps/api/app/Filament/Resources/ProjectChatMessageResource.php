<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectChatMessageResource\Pages;
use App\Models\ProjectMessage;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProjectChatMessageResource extends Resource
{
    protected static ?string $model = ProjectMessage::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-chat-bubble-left-right';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.project_messages');
    }

    protected static ?int $navigationSort = 4;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Message Details')
                    ->components([
                        FormComponents\Select::make('project_id')
                            ->relationship('project', 'name')
                            ->required()
                            ->disabled(),

                        FormComponents\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->required()
                            ->disabled(),

                        FormComponents\Textarea::make('content')
                            ->columnSpanFull()
                            ->disabled(),

                        FormComponents\Toggle::make('is_pinned')
                            ->disabled(),

                        FormComponents\Toggle::make('is_system')
                            ->disabled(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('sequence_id')
                    ->label('#')
                    ->sortable(),

                Tables\Columns\TextColumn::make('project.name')
                    ->label('Project')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('user.name')
                    ->label('Author')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('content')
                    ->label('Message Content')
                    ->limit(60)
                    ->searchable(),

                Tables\Columns\IconColumn::make('is_pinned')
                    ->label('Pinned')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_system')
                    ->label('System')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Sent At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('project')
                    ->relationship('project', 'name')
                    ->searchable()
                    ->preload(),
                Tables\Filters\TernaryFilter::make('is_pinned')
                    ->label('Pinned only'),
                Tables\Filters\TernaryFilter::make('is_system')
                    ->label('System messages only'),
            ])
            ->actions([
                ViewAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjectChatMessages::route('/'),
        ];
    }
}
