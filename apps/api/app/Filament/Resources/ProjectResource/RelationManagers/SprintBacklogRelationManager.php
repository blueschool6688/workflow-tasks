<?php

namespace App\Filament\Resources\ProjectResource\RelationManagers;

use App\Models\Task;

use Filament\Actions\CreateAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class SprintBacklogRelationManager extends RelationManager
{
    protected static string $relationship = 'tasks';

    protected static ?string $title = 'Project Backlog & Sprint Tasks';

    protected static ?string $recordTitleAttribute = 'title';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\TextInput::make('task_number')
                    ->required()
                    ->maxLength(50),

                FormComponents\TextInput::make('title')
                    ->required()
                    ->maxLength(255),

                FormComponents\Select::make('type')
                    ->options([
                        'task' => 'Task',
                        'bug' => 'Bug',
                        'story' => 'Story',
                        'epic' => 'Epic',
                        'subtask' => 'Subtask',
                    ])
                    ->required(),

                FormComponents\Select::make('status_id')
                    ->relationship('status', 'name')
                    ->required(),

                FormComponents\Select::make('sprint_id')
                    ->relationship('sprint', 'name')
                    ->nullable(),
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

                Tables\Columns\TextColumn::make('sprint.name')
                    ->label('Sprint')
                    ->default('Backlog (Unassigned)')
                    ->badge()
                    ->colors(['info' => fn ($state) => $state !== 'Backlog (Unassigned)']),

                Tables\Columns\TextColumn::make('type')
                    ->badge(),

                Tables\Columns\TextColumn::make('status.name')
                    ->badge()
                    ->colors(['primary']),

                Tables\Columns\TextColumn::make('priority')
                    ->badge(),

                Tables\Columns\TextColumn::make('assignee.name')
                    ->default('Unassigned'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('sprint')
                    ->relationship('sprint', 'name')
                    ->placeholder('All Tasks & Backlog'),
            ])
            ->headerActions([
                CreateAction::make()
                    ->mutateFormDataUsing(function (array $data): array {
                        /** @var \App\Models\Project $project */
                        $project = $this->getOwnerRecord();
                        $data['reporter_id'] = auth()->id();
                        $taskCount = $project->tasks()->count() + 1;
                        $data['task_number'] = $project->key . '-' . $taskCount;
                        return $data;
                    }),
            ])
            ->actions([
                EditAction::make(),
            ]);
    }
}
