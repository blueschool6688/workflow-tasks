<?php

namespace App\Filament\Resources\EpicResource\Pages;

use App\Filament\Resources\EpicResource;
use Filament\Actions;
use Filament\Resources\Pages\ListRecords;

class ListEpics extends ListRecords
{
    protected static string $resource = EpicResource::class;

    protected function getHeaderActions(): array
    {
        return [
            Actions\CreateAction::make(),
        ];
    }
}
