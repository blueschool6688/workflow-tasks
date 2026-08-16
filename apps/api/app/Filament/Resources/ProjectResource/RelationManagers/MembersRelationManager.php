<?php

namespace App\Filament\Resources\ProjectResource\RelationManagers;

use Filament\Actions\AttachAction;
use Filament\Actions\DetachAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components as FormComponents;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables;
use Filament\Tables\Table;

class MembersRelationManager extends RelationManager
{
    protected static string $relationship = 'members';

    protected static ?string $recordTitleAttribute = 'name';

    public function form(Schema $schema): Schema
    {
        return $schema
            ->components([
                FormComponents\Select::make('role_in_project')
                    ->options([
                        'lead' => 'Project Lead',
                        'manager' => 'Manager',
                        'developer' => 'Developer',
                        'reporter' => 'Reporter',
                        'viewer' => 'Viewer',
                    ])
                    ->required()
                    ->default('developer'),
            ]);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                Tables\Columns\TextColumn::make('name')
                    ->searchable()
                    ->sortable(),

                Tables\Columns\TextColumn::make('email')
                    ->searchable(),

                Tables\Columns\TextColumn::make('pivot.role_in_project')
                    ->label('Role in Project')
                    ->badge()
                    ->colors([
                        'primary' => 'lead',
                        'info' => 'manager',
                        'success' => 'developer',
                        'warning' => 'reporter',
                        'gray' => 'viewer',
                    ]),
            ])
            ->headerActions([
                AttachAction::make()
                    ->form(fn (AttachAction $action): array => [
                        $action->getRecordSelect(),
                        FormComponents\Select::make('role_in_project')
                            ->options([
                                'lead' => 'Project Lead',
                                'manager' => 'Manager',
                                'developer' => 'Developer',
                                'reporter' => 'Reporter',
                                'viewer' => 'Viewer',
                            ])
                            ->required()
                            ->default('developer'),
                    ]),
            ])
            ->actions([
                EditAction::make(),
                DetachAction::make(),
            ]);
    }
}
