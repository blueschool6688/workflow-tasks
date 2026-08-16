<?php

namespace App\Filament\Resources\WorkflowResource\RelationManagers;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class TransitionsRelationManager extends RelationManager
{
    protected static string $relationship = 'transitions';

    protected static ?string $recordTitleAttribute = 'name';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\TextInput::make('name')
                    ->label('Transition Name')
                    ->required()
                    ->maxLength(255),

                FormComponents\Select::make('from_status_id')
                    ->label('From Status')
                    ->relationship('fromStatus', 'name')
                    ->required(),

                FormComponents\Select::make('to_status_id')
                    ->label('To Status')
                    ->relationship('toStatus', 'name')
                    ->required(),

                FormComponents\KeyValue::make('rules')
                    ->label('Transition Rules (allowed_roles, etc.)')
                    ->columnSpanFull(),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable(),

                Tables\Columns\TextColumn::make('fromStatus.name')
                    ->label('From Status')
                    ->badge(),

                Tables\Columns\TextColumn::make('toStatus.name')
                    ->label('To Status')
                    ->badge(),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ]);
    }
}
