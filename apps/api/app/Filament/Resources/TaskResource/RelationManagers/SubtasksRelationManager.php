<?php

namespace App\Filament\Resources\TaskResource\RelationManagers;

use App\Models\Task;
use Filament\Actions\Action;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class SubtasksRelationManager extends RelationManager
{
    protected static string $relationship = 'subtasks';

    protected static ?string $recordTitleAttribute = 'title';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\TextInput::make('title')
                    ->required()
                    ->maxLength(255)
                    ->columnSpanFull(),

                FormComponents\Select::make('status_id')
                    ->relationship('status', 'name')
                    ->required()
                    ->searchable(),

                FormComponents\Select::make('priority')
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                        'urgent' => 'Urgent',
                    ])
                    ->required()
                    ->default('medium'),

                FormComponents\Select::make('assignee_id')
                    ->relationship('assignee', 'name')
                    ->searchable()
                    ->preload()
                    ->nullable(),

                FormComponents\TextInput::make('estimate_minutes')
                    ->numeric()
                    ->suffix('mins'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('task_number')
                    ->badge()
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('title')
                    ->searchable()
                    ->sortable(),

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
                    ->default('Unassigned'),
            ])
            ->headerActions([
                Action::make('linkExistingTask')
                    ->label('Chọn Task có sẵn làm Subtask')
                    ->icon('heroicon-o-link')
                    ->color('primary')
                    ->form([
                        FormComponents\Select::make('subtask_id')
                            ->label('Select Existing Task in Project')
                            ->options(function () {
                                /** @var \App\Models\Task $parentTask */
                                $parentTask = $this->getOwnerRecord();
                                return Task::where('project_id', $parentTask->project_id)
                                    ->whereNull('parent_task_id')
                                    ->where('id', '!=', $parentTask->id)
                                    ->pluck('title', 'id');
                            })
                            ->required()
                            ->searchable()
                            ->preload(),
                    ])
                    ->action(function (array $data): void {
                        /** @var \App\Models\Task $parentTask */
                        $parentTask = $this->getOwnerRecord();
                        Task::where('id', $data['subtask_id'])->update([
                            'parent_task_id' => $parentTask->id,
                            'type' => 'subtask',
                        ]);
                    }),

                CreateAction::make('createNewSubtask')
                    ->label('Tạo Subtask mới')
                    ->icon('heroicon-o-plus')
                    ->mutateFormDataUsing(function (array $data): array {
                        /** @var \App\Models\Task $parentTask */
                        $parentTask = $this->getOwnerRecord();
                        $data['project_id'] = $parentTask->project_id;
                        $data['reporter_id'] = auth()->id() ?? $parentTask->reporter_id;
                        $data['type'] = 'subtask';
                        $subCount = $parentTask->subtasks()->count() + 1;
                        $data['task_number'] = $parentTask->task_number . '-S' . $subCount;
                        return $data;
                    }),
            ])
            ->actions([
                EditAction::make(),
                Action::make('unlinkSubtask')
                    ->label('Hủy gán Subtask')
                    ->icon('heroicon-o-link-slash')
                    ->color('warning')
                    ->action(fn (Task $record) => $record->update([
                        'parent_task_id' => null,
                        'type' => 'task',
                    ])),
                DeleteAction::make(),
            ]);
    }
}
