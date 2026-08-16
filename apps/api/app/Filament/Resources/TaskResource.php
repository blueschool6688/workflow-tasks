<?php

namespace App\Filament\Resources;

use App\Filament\Resources\TaskResource\Pages;
use App\Models\Task;
use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class TaskResource extends Resource
{
    protected static ?string $model = Task::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-check-circle';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.tasks');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Task Details')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\Select::make('project_id')
                            ->relationship('project', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('task_number')
                            ->required()
                            ->maxLength(50)
                            ->helperText('e.g. PROJ-101')
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('title')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        FormComponents\Select::make('type')
                            ->options([
                                'task' => 'Task',
                                'bug' => 'Bug',
                                'story' => 'Story',
                                'epic' => 'Epic',
                                'subtask' => 'Subtask',
                            ])
                            ->required()
                            ->default('task')
                            ->columnSpanFull(),

                        FormComponents\Select::make('status_id')
                            ->relationship('status', 'name')
                            ->required()
                            ->searchable()
                            ->columnSpanFull(),

                        FormComponents\Select::make('priority')
                            ->options([
                                'low' => 'Low',
                                'medium' => 'Medium',
                                'high' => 'High',
                                'urgent' => 'Urgent',
                            ])
                            ->required()
                            ->default('medium')
                            ->columnSpanFull(),

                        FormComponents\Select::make('assignee_id')
                            ->relationship('assignee', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->columnSpanFull(),

                        FormComponents\Select::make('reporter_id')
                            ->relationship('reporter', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),

                        FormComponents\Select::make('sprint_id')
                            ->relationship('sprint', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->columnSpanFull(),

                        FormComponents\DatePicker::make('due_date')
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('estimate_minutes')
                            ->numeric()
                            ->suffix('mins')
                            ->columnSpanFull(),
                    ])->columns(1),

                Components\Section::make('Task Content')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\RichEditor::make('description')
                            ->columnSpanFull(),
                    ]),

                Components\Section::make('Task Brain & Acceptance Criteria')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\RichEditor::make('brain_notes')
                            ->helperText('Notes, technical decisions, or acceptance criteria for this task')
                            ->columnSpanFull(),
                    ]),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('task_number')
                    ->badge()
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable()
                    ->limit(40),

                Tables\Columns\TextColumn::make('project.name')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('type')
                    ->badge(),

                Tables\Columns\TextColumn::make('status.name')
                    ->badge()
                    ->colors(['primary']),

                Tables\Columns\TextColumn::make('priority')
                    ->badge()
                    ->colors([
                        'neutral' => 'low',
                        'info' => 'medium',
                        'warning' => 'high',
                        'danger' => 'urgent',
                    ]),

                Tables\Columns\TextColumn::make('assignee.name')
                    ->default('Unassigned')
                    ->searchable(),

                Tables\Columns\TextColumn::make('due_date')
                    ->dateTime()
                    ->sortable(),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('priority')
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                        'urgent' => 'Urgent',
                    ]),
                Tables\Filters\SelectFilter::make('type')
                    ->options([
                        'task' => 'Task',
                        'bug' => 'Bug',
                        'story' => 'Story',
                        'epic' => 'Epic',
                        'subtask' => 'Subtask',
                    ]),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            TaskResource\RelationManagers\SubtasksRelationManager::class,
            TaskResource\RelationManagers\CommentsRelationManager::class,
            TaskResource\RelationManagers\WorkLogsRelationManager::class,
            TaskResource\RelationManagers\AttachmentsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListTasks::route('/'),
            'create' => Pages\CreateTask::route('/create'),
            'edit' => Pages\EditTask::route('/{record}/edit'),
        ];
    }
}
