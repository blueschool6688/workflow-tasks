<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WorkflowResource\Pages;
use App\Models\Workflow;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WorkflowResource extends Resource
{
    protected static ?string $model = Workflow::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-arrow-path-rounded-square';

    protected static \UnitEnum|string|null $navigationGroup = 'Project & Workflow Configuration';

    protected static ?int $navigationSort = 1;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Workflow Definition')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\Select::make('workspace_id')
                            ->relationship('workspace', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->helperText('Leave empty for global company-wide workflow template')
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        FormComponents\Textarea::make('description')
                            ->columnSpanFull(),

                        FormComponents\Toggle::make('is_default')
                            ->label('Set as Default Workflow for Workspace')
                            ->default(false)
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

                Tables\Columns\TextColumn::make('workspace.name')
                    ->label('Scope')
                    ->default('Global Template')
                    ->badge(),

                Tables\Columns\TextColumn::make('statuses_count')
                    ->counts('statuses')
                    ->label('Statuses'),

                Tables\Columns\IconColumn::make('is_default')
                    ->boolean()
                    ->label('Default'),

                Tables\Columns\TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            WorkflowResource\RelationManagers\StatusesRelationManager::class,
            WorkflowResource\RelationManagers\TransitionsRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWorkflows::route('/'),
            'create' => Pages\CreateWorkflow::route('/create'),
            'edit' => Pages\EditWorkflow::route('/{record}/edit'),
        ];
    }
}
