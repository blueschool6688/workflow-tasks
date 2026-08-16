<?php

$dir = __DIR__ . '/app/Filament/Resources';
$files = glob($dir . '/*.php');

$formFields = [
    'TextInput', 'Select', 'Toggle', 'Checkbox', 'CheckboxList', 
    'Radio', 'Textarea', 'Hidden', 'DateTimePicker', 'DatePicker', 
    'TimePicker', 'ColorPicker', 'RichEditor', 'MarkdownEditor',
    'FileUpload', 'Repeater', 'Builder', 'TagsInput', 'KeyValue',
    'ToggleButtons'
];

foreach ($files as $file) {
    $content = file_get_contents($file);
    
    // Add use Filament\Forms\Components as FormComponents;
    if (strpos($content, 'use Filament\Forms\Components as FormComponents;') === false) {
        $content = str_replace(
            "use Filament\Schemas\Components;",
            "use Filament\Schemas\Components;\nuse Filament\Forms\Components as FormComponents;",
            $content
        );
    }
    
    // Replace Components\Field with FormComponents\Field
    foreach ($formFields as $field) {
        $content = str_replace("Components\\{$field}::", "FormComponents\\{$field}::", $content);
    }
    
    file_put_contents($file, $content);
}

echo "Fixed namespaces and components in ".count($files)." files\n";
