<?php

namespace App\Filament\Resources;

use App\Filament\Resources\EpicResource\Pages;
use App\Models\Epic;
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

class EpicResource extends Resource
{
    protected static ?string $model = Epic::class;

    protected static \BackedEnum|string|null $navigationIcon = 'heroicon-o-bolt';

    public static function getNavigationGroup(): ?string
    {
        return __('admin.navigation.groups.task_agile');
    }

    public static function getNavigationLabel(): string
    {
        return __('admin.navigation.labels.epics');
    }

    public static function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                Components\Section::make('Epic Details')
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

                        FormComponents\ColorPicker::make('color')
                            ->default('#6366f1')
                            ->columnSpanFull(),

                        FormComponents\Textarea::make('summary')
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

                Tables\Columns\ColorColumn::make('color'),

                Tables\Columns\TextColumn::make('tasks_count')
                    ->counts('tasks')
                    ->label('Tasks'),

                Tables\Columns\TextColumn::make('created_at')
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

    public static function getPages(): array
    {
        return [
            'index' => Pages\ListEpics::route('/'),
            'create' => Pages\CreateEpic::route('/create'),
            'edit' => Pages\EditEpic::route('/{record}/edit'),
        ];
    }
}
