<?php

$dir = __DIR__ . '/app/Filament/Resources';
$files = glob($dir . '/*.php');

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    $content = str_replace('use Filament\Forms\Components;', 'use Filament\Schemas\Components;', $content);
    $content = str_replace('use Filament\Forms\Form;', 'use Filament\Schemas\Schema;', $content);
    $content = str_replace('public static function form(Form $form): Form', 'public static function form(Schema $schema): Schema', $content);
    $content = str_replace('return $form', 'return $schema', $content);
    $content = str_replace('->schema([', '->components([', $content);
    
    file_put_contents($file, $content);
}

echo "Reverted ".count($files)." files\n";
