<?php

namespace App\Filament\Resources;

use App\Filament\Resources\WorkspaceResource\Pages;
use App\Models\Workspace;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Schemas\Components;
use Filament\Forms\Components as FormComponents;
use Filament\Schemas\Schema;
use Filament\Resources\Resource;
use Filament\Tables;
use Filament\Tables\Table;

class WorkspaceResource extends Resource
{
    protected static ?string $model = Workspace::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-squares-2x2';

    protected static \UnitEnum|string|null $navigationGroup = 'Organization & Workspaces';

    protected static ?int $navigationSort = 2;

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Workspace Details')
                    ->columnSpanFull()
                    ->components([
                        FormComponents\Select::make('organization_id')
                            ->relationship('organization', 'name')
                            ->required()
                            ->searchable()
                            ->preload()
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('name')
                            ->required()
                            ->maxLength(255)
                            ->live(onBlur: true)
                            ->afterStateUpdated(fn ($state, $set) => $set('slug', \Illuminate\Support\Str::slug($state)))
                            ->columnSpanFull(),

                        FormComponents\TextInput::make('slug')
                            ->required()
                            ->maxLength(255)
                            ->columnSpanFull(),

                        FormComponents\Textarea::make('description')
                            ->columnSpanFull(),

                        FormComponents\Toggle::make('is_active')
                            ->default(true)
                            ->required()
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

                Tables\Columns\TextColumn::make('organization.name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('projects_count')
                    ->counts('projects')
                    ->label('Projects'),

                Tables\Columns\TextColumn::make('members_count')
                    ->counts('members')
                    ->label('Members'),

                Tables\Columns\IconColumn::make('is_active')
                    ->boolean()
                    ->sortable(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListWorkspaces::route('/'),
            'create' => Pages\CreateWorkspace::route('/create'),
            'edit' => Pages\EditWorkspace::route('/{record}/edit'),
        ];
    }
}
