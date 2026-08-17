<?php

namespace App\Filament\Resources;

use App\Filament\Resources\NotificationResource\Pages;
use App\Models\Notification;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class NotificationResource extends Resource
{
    protected static ?string $model = Notification::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-bell';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.notifications');
    }

    protected static ?int $navigationSort = 5;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Notification Details')
                    ->components([
                        FormComponents\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->required()
                            ->searchable(),

                        FormComponents\Select::make('sender_id')
                            ->relationship('sender', 'name')
                            ->searchable()
                            ->nullable(),

                        FormComponents\TextInput::make('type')
                            ->required(),

                        FormComponents\TextInput::make('title')
                            ->required()
                            ->maxLength(255),

                        FormComponents\Textarea::make('message')
                            ->columnSpanFull(),

                        FormComponents\Toggle::make('is_read')
                            ->disabled(),
                    ])->columns(2),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Recipient')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('type')
                    ->badge()
                    ->sortable(),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\IconColumn::make('is_read')
                    ->label('Read')
                    ->boolean()
                    ->sortable(),

                Tables\Columns\TextColumn::make('created_at')
                    ->label('Created At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('created_at', 'desc')
            ->filters([
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'task_assigned' => 'Task Assigned',
                        'mention' => 'Mention',
                        'status_change' => 'Status Change',
                        'comment' => 'Comment',
                        'sprint_started' => 'Sprint Started',
                    ]),
                Tables\Filters\TernaryFilter::make('is_read')
                    ->label('Read only'),
            ])
            ->actions([
                ViewAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListNotifications::route('/'),
        ];
    }
}
