<?php
function env($k, $d = null) { return $d; }
function config($k = null, $d = null) { return $d; }
function base_path($p = '') { return (getenv('LABO') ?: '/home/debian/labo/my_website2').'/'.$p; }
function resource_path($p = '') { return base_path('resources/'.$p); }
function public_path($p = '') { return base_path('public/'.$p); }
$c = include base_path('config/ploxions.php');
$out = [];
foreach ($c['ploxions'] as $k => $v) { if (!is_array($v)) continue; $v['_cle'] = $k; $out[] = $v; }
echo json_encode($out, JSON_UNESCAPED_UNICODE|JSON_UNESCAPED_SLASHES);
