<?php
require __DIR__ . "/inc/bootstrap.php";
header('Access-Control-Allow-Origin: http://localhost:3001');

$uri = parse_url($_SERVER["REQUEST_URI"], PHP_URL_PATH);
$uri = explode("/", $uri);

if ((isset($uri[1]) && $uri[1] != "user") || !isset($uri[2])) {
    header("HTTP/1.1 404 Not Found");
    exit();
}

$objFeedController = new EmployeeController();
$strMethodName = $uri[2] . 'Action';
$objFeedController->{$strMethodName}();
?>