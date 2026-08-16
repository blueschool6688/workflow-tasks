<?php

namespace App\Filament\Resources;

use App\Filament\Resources\ProjectResource\Pages;
use App\Models\Project;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class ProjectResource extends Resource
{
    protected static ?string $model = Project::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-folder';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.project_config');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.projects');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Project Overview')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\Select::make('workspace_id')
                            ->relationship('workspace', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(function ($state, $set, $get) {
                                if (! $get('key') && ! empty($state)) {
                                    $words = preg_split('/\s+/', trim($state));
                                    $key = count($words) > 1
                                        ? strtoupper(substr($words[0], 0, 2) . substr($words[1], 0, 2))
                                        : strtoupper(substr($state, 0, 4));
                                    $set('key', substr($key, 0, 10));
                                }
                            })
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('key')
                            ->required()
                            ->maxLength(10)
                            ->dehydrateStateUsing(fn ($state) => strtoupper($state))
                            ->extraInputAttributes(['style' => 'text-transform: uppercase'])
                            ->helperText('Short prefix for tasks (e.g. PROJ)')
                            ->columnSpanFull(),

                        FormComponents\Select::make('type')
                            ->options([
                                'scrum' => 'Scrum (Sprints + Backlog)',
                                'kanban' => 'Kanban (Continuous Flow)',
                                'freeform' => 'Free-form',
                            ])
                            ->required()
                            ->default('kanban')
                            ->columnSpanFull(),

                        FormComponents\Select::make('status')
                            ->options([
                                'active' => 'Active',
                                'archived' => 'Archived',
                                'completed' => 'Completed',
                            ])
                            ->required()
                            ->default('active')
                            ->columnSpanFull(),

                        FormComponents\Select::make('workflow_id')
                            ->relationship('workflow', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->columnSpanFull(),

                        FormComponents\Select::make('lead_id')
                            ->relationship('lead', 'name')
                            ->searchable()
                            ->preload()
                            ->nullable()
                            ->columnSpanFull(),

                        FormComponents\DatePicker::make('start_date')
                            ->columnSpanFull(),

                        FormComponents\DatePicker::make('target_end_date')
                            ->columnSpanFull(),

                        FormComponents\Textarea::make('description')
                            ->columnSpanFull(),
                    ])->columns(1),
            ]);
    }

    public static function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('key')
                    ->badge()
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('workspace.name')
                    ->sortable()
                    ->searchable(),

                Tables\Columns\TextColumn::make('type')
                    ->badge(),

                Tables\Columns\TextColumn::make('status')
                    ->badge()
                    ->colors([
                        'success' => 'active',
                        'warning' => 'archived',
                        'info' => 'completed',
                    ]),

                Tables\Columns\TextColumn::make('lead.name')
                    ->label('Project Lead'),
            ])
            ->filters([
                Tables\Filters\SelectFilter::make('status')
                    ->options([
                        'active' => 'Active',
                        'archived' => 'Archived',
                        'completed' => 'Completed',
                    ]),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getRelations(): array
    {
        return [
            ProjectResource\RelationManagers\MembersRelationManager::class,
            ProjectResource\RelationManagers\SprintBacklogRelationManager::class,
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListProjects::route('/'),
            'create' => Pages\CreateProject::route('/create'),
            'edit' => Pages\EditProject::route('/{record}/edit'),
        ];
    }
}
