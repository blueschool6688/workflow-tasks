<?php

$dir = __DIR__ . '/app/Filament/Resources';
$files = glob($dir . '/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    $content = str_replace('use Filament\Schemas\Components;', 'use Filament\Forms\Components;', $content);
    $content = str_replace('use Filament\Schemas\Schema;', 'use Filament\Forms\Form;', $content);
    $content = str_replace('public static function form(Schema $schema): Schema', 'public static function form(Form $form): Form', $content);
    $content = str_replace('return $schema', 'return $form', $content);
    $content = str_replace('->components([', '->schema([', $content);
    
    file_put_contents($file, $content);
}

echo "Fixed ".count($files)." files\n";
