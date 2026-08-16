<?php

namespace App\Filament\Resources\SprintResource\RelationManagers;

use App\Models\Task;
use Filament\Actions\Action;
use Filament\Actions\EditAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class BacklogRelationManager extends RelationManager
{
    protected static string $relationship = 'tasks';

    protected static ?string $title = 'Sprint Tasks & Backlog';

    protected static ?string $recordTitleAttribute = 'title';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\TextInput::make('title')
                    ->required()
                    ->maxLength(255),

                FormComponents\Select::make('status_id')
                    ->relationship('status', 'name')
                    ->required(),

                FormComponents\Select::make('priority')
                    ->options([
                        'low' => 'Low',
                        'medium' => 'Medium',
                        'high' => 'High',
                        'urgent' => 'Urgent',
                    ])
                    ->required(),
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
                    ->default('Unassigned'),
            ])
            ->headerActions([
                Action::make('addFromBacklog')
                    ->label('Add Task from Project Backlog')
                    ->icon('heroicon-o-plus')
                    ->form([
                        FormComponents\Select::make('task_id')
                            ->label('Select Backlog Task')
                            ->options(function () {
                                /** @var \App\Models\Sprint $sprint */
                                $sprint = $this->getOwnerRecord();
                                return Task::where('project_id', $sprint->project_id)
                                    ->whereNull('sprint_id')
                                    ->pluck('title', 'id');
                            })
                            ->required()
                            ->searchable(),
                    ])
                    ->action(function (array $data): void {
                        /** @var \App\Models\Sprint $sprint */
                        $sprint = $this->getOwnerRecord();
                        Task::where('id', $data['task_id'])->update(['sprint_id' => $sprint->id]);
                    }),
            ])
            ->actions([
                EditAction::make(),
                Action::make('removeFromSprint')
                    ->label('Move to Backlog')
                    ->icon('heroicon-o-arrow-left-on-rectangle')
                    ->color('warning')
                    ->action(fn (Task $record) => $record->update(['sprint_id' => null])),
            ]);
    }
}
