<?php
require 'vendor/autoload.php';

$r = new ReflectionClass(Filament\Resources\Resource::class);
foreach ($r->getProperties() as $p) {
    if (str_contains($p->getName(), 'navigation')) {
        echo $p->getName() . ' => ' . (string)$p->getType() . "\n";
    }
}
