<?php

include ('config.getSID.php');
$sid_file = (file_get_contents($path));
$heute = date("Y-m-d H:i:s");
$username = $fb_username;
$password = $fb_password;
$loginurl = $fb_loginurl;
print "\n" . $heute . "  Starte SID Script. Bisherige SID: " . $sid_file . "\n";
$sid = get_sid($loginurl, $username, $password, $sid_file, $path);


function get_sid($loginurl, $username, $password, $sid_file, $path)
{
    $heute = date("Y-m-d H:i:s");
    $http_response = @file_get_contents($loginurl."?sid=".$sid_file);
    $xml = @simplexml_load_string($http_response);
    if (! $xml || ! $xml->Challenge) {
        die("Error: Unerwartete Antwort oder Kommunikationsfehler!\n");
    }
    
    $challenge = (string) $xml->Challenge;
    $sid = (string) $xml->SID;
    if (preg_match("/^[0]+$/", $sid) && $challenge) {
        
        $sid = "";
        $pass = $challenge . "-" . $password;
        $pass = mb_convert_encoding($pass, "UTF-16LE");
        $md5 = md5($pass);
        $challenge_response = $challenge . "-" . $md5;
        $url = $loginurl . "?username=" . $username . "&response=" . $challenge_response;
        $http_response = file_get_contents($url);
        $xml = simplexml_load_string($http_response);
        $sid = (string) $xml->SID;
        if ((strlen($sid) > 0) && ! preg_match("/^[0]+$/", $sid)) {
            print $heute . " # Neue SID wurde ausgehandelt ---> $sid \n";
            file_put_contents($path, $sid);
            return $sid;
        }
    } else {
        print $heute . " # Nutze vorhandene SID: " . $sid . "\n";
        if ((strlen($sid) > 0) && (preg_match("/^[0-9a-f]+$/", $sid)))
            return $sid;
    }
    
    die("Error: SID Null!\n");
}

$sid__file = (file_get_contents($path));
print $heute . "  SID Script beendet. Gespeicherte SID: " . $sid__file . "\n";
?>