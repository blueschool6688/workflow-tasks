<?php

namespace App\Filament\Resources;

use App\Filament\Resources\SprintResource\Pages;
use App\Models\Sprint;
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

class SprintResource extends Resource
{
    protected static ?string $model = Sprint::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-play-pause';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.sprints');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Sprint Details')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\Select::make('project_id')
                            ->relationship('project', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        FormComponents\Select::make('status')
                            ->options([
                                'future' => 'Future (Planned)',
                                'active' => 'Active',
                                'completed' => 'Completed',
                            ])
                            ->required()
                            ->default('future')
                            ->columnSpanFull(),

                        FormComponents\DateTimePicker::make('start_date')
                            ->columnSpanFull(),

                        FormComponents\DateTimePicker::make('end_date')
                            ->columnSpanFull(),

                        FormComponents\Textarea::make('goal')
                            ->columnSpanFull(),
                    ])->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('project.name')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'neutral' => 'future',
                        'success' => 'active',
                        'info' => 'completed',
                    ]),

                Tables\Columns\TextColumn::make('tasks_count')
                    ->counts('tasks')
                    ->label('Tasks'),

                Tables\Columns\TextColumn::make('start_date')
                    ->dateTime()
                    ->sortable(),

                Tables\Columns\TextColumn::make('end_date')
                    ->dateTime()
                    ->sortable(),
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
            SprintResource\RelationManagers\BacklogRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListSprints::route('/'),
            'create' => Pages\CreateSprint::route('/create'),
            'edit' => Pages\EditSprint::route('/{record}/edit'),
        ];
    }
}
