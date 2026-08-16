<?php

namespace App\Filament\Resources\TaskResource\RelationManagers;

use App\Models\TaskWorkLog;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class WorkLogsRelationManager extends RelationManager
{
    protected static string $relationship = 'workLogs';

    protected static ?string $title = 'Nhật ký thao tác & Thời gian làm việc (Work Logs)';

    protected static ?string $recordTitleAttribute = 'action';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\Select::make('user_id')
                    ->relationship('user', 'name')
                    ->default(fn () => auth()->id())
                    ->required()
                    ->searchable(),

                FormComponents\TextInput::make('action')
                    ->required()
                    ->default('Code Review & Development')
                    ->placeholder('e.g. Code Review, Bug Fix, Investigation, QA Testing')
                    ->maxLength(255),

                FormComponents\TextInput::make('minutes_logged')
                    ->numeric()
                    ->required()
                    ->default(60)
                    ->suffix('mins'),

                FormComponents\DateTimePicker::make('logged_at')
                    ->default(now())
                    ->required(),

                FormComponents\Textarea::make('note')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('user.name')
                    ->label('Thành viên')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('action')
                    ->label('Hành động / Tương tác')
                    ->badge()
                    ->colors([
                        'primary' => fn ($state) => str_contains(strtolower($state), 'review'),
                        'success' => fn ($state) => str_contains(strtolower($state), 'fix') || str_contains(strtolower($state), 'dev'),
                        'warning' => fn ($state) => str_contains(strtolower($state), 'investig') || str_contains(strtolower($state), 'qa'),
                        'info' => true,
                    ])
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('minutes_logged')
                    ->label('Thời gian')
                    ->formatStateUsing(fn ($state) => $state ? (floor($state / 60) . 'h ' . ($state % 60) . 'm') : '-')
                    ->sortable(),

                Tables\Columns\TextColumn::make('note')
                    ->label('Ghi chú chi tiết')
                    ->limit(60)
                    ->wrap(),

                Tables\Columns\TextColumn::make('logged_at')
                    ->label('Thời gian thao tác')
                    ->dateTime()
                    ->sortable(),
            ])
            ->headerActions([
                CreateAction::make()
                    ->label('Ghi nhận thời gian / Thao tác')
                    ->icon('heroicon-o-clock')
                    ->mutateFormDataUsing(function (array $data): array {
                        $user = auth()->user();
                        $data['user_id'] = $data['user_id'] ?? $user?->id;
                        
                        /** @var \App\Models\Task $task */
                        $task = $this->getOwnerRecord();

                        // Automatically log to Spatie Activity Log as well
                        activity('task_workflow')
                            ->performedOn($task)
                            ->causedBy($user)
                            ->withProperties(['action' => $data['action'], 'minutes' => $data['minutes_logged']])
                            ->log("Logged work: {$data['action']} ({$data['minutes_logged']} mins)");

                        return $data;
                    }),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}
