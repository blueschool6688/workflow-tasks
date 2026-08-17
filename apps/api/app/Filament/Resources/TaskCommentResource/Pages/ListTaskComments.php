<?php

namespace App\Filament\Resources\TaskCommentResource\Pages;

use App\Filament\Resources\TaskCommentResource;
use Filament\Resources\Pages\ListRecords;

class ListTaskComments extends ListRecords
{
    protected static string $resource = TaskCommentResource::class;
}
