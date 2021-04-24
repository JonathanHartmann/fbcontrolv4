<?php
// error_reporting(E_ALL);
error_reporting(0);
include_once ('config_website.php');
$db = new mysqli($mysql_servername, $mysql_username, $mysql_password, $mysql_db);

if ($db->connect_errno) {
    die('Sorry - gerade gibt es ein Problem');
}
?>