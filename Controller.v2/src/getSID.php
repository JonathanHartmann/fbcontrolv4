<?php
include ('config.getSID.php');
$sid_file = (file_get_contents($path));
$sid_file_decrypt = openssl_decrypt($sid_file, "AES-128-ECB", $encryptkey);
$heute = date("Y-m-d H:i:s");
$username = $fb_username;
$password = $fb_password;
$loginurl = $fb_loginurl;
print "\n" . $heute . "  Starte SID Script. Bisherige verschluesselte SID: " . $sid_file . "\n";
$sid = get_sid($loginurl, $username, $password, $sid_file_decrypt, $path, $encryptkey);

function get_sid($loginurl, $username, $password, $sid_file_decrypt, $path, $encryptkey)
{
    $heute = date("Y-m-d H:i:s");
    $http_response = @file_get_contents($loginurl . "?sid=" . $sid_file_decrypt);
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
            $sid_encrypt = openssl_encrypt($sid, "AES-128-ECB", $encryptkey);
            file_put_contents($path, $sid_encrypt);
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
print $heute . "  SID Script beendet. Gespeicherte verschluesselte SID: " . $sid__file . "\n";
?>