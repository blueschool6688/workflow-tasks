<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TaskWorkLogResource\Pages;
use App\Models\TaskWorkLog;
use Filament\Actions\DeleteAction;
use Filament\Actions\ViewAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TaskWorkLogResource extends Resource
{
    protected static ?string $model = TaskWorkLog::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-clock';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.task_work_logs');
    }

    protected static ?int $navigationSort = 7;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Work Log Details')
                    ->components([
                        FormComponents\Select::make('task_id')
                            ->relationship('task', 'title')
                            ->required()
                            ->disabled(),

                        FormComponents\Select::make('user_id')
                            ->relationship('user', 'name')
                            ->required()
                            ->disabled(),

                        FormComponents\TextInput::make('minutes_logged')
                            ->label('Minutes Logged')
                            ->numeric()
                            ->disabled(),

                        FormComponents\TextInput::make('action')
                            ->disabled(),

                        FormComponents\Textarea::make('note')
                            ->columnSpanFull()
                            ->disabled(),

                        FormComponents\DateTimePicker::make('logged_at')
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
                    ->label('User')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('minutes_logged')
                    ->label('Duration')
                    ->formatStateUsing(fn ($state) => sprintf('%dh %02dm', intdiv($state, 60), $state % 60))
                    ->sortable(),

                Tables\Columns\TextColumn::make('note')
                    ->label('Note / Work Description')
                    ->limit(50)
                    ->searchable(),

                Tables\Columns\TextColumn::make('logged_at')
                    ->label('Logged At')
                    ->dateTime()
                    ->sortable(),
            ])
            ->defaultSort('logged_at', 'desc')
            ->actions([
                ViewAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTaskWorkLogs::route('/'),
        ];
    }
}
