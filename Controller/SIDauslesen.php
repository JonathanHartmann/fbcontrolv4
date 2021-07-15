<?php
//Anmelde- und Hostdaten
//TODO: SID nicht neu holen, sondern speichern
//TODO: Logging hinzufügen (Fehlercodes und Schaltpunkte sollen geloggt werden)
//TODO: dbabfrage und dbabfrage_endzeit zusammenfassen
//TODO: Einträge die 2 Monate zurück liegen aus der DB löschen
//TODO: Ferientermine hinzufügen
//TODO: Datenbank SQl Datei, zum erstellen von Tabellen,erstellen
//TODO: Datenbank Struktur ändern (Performanter)
//TODO: Conflict Time Bug 08.12.19 8:45Uhr
//TODO: Eintragungs Timestamp einfügen

//Fritzbox Gemeindehaus
include('config_fbcontrol.php');
$heute = date("Y-m-d H:i:s"); 
$username=$fb_username; //eintragen wenn gesetzt
$password=$fb_password; //anpassen!
$loginurl=$fb_loginurl; //Host bei Bedarf anpassen
$ahaurl=$fb_ahaurl;

//Login-Funktion
function get_sid ($loginurl,$username,$password) {
    $heute = date("Y-m-d H:i:s"); 
    //Sende initialen Request an Fritzbox
    $http_response = @file_get_contents($loginurl);
    //Parse Antwort XML
   // print "Login URL --> $loginurl \n";
   // print "Response --> $http_response \n ";
    $xml = @simplexml_load_string($http_response);
    //print "XML Antwort --> $xml \n";
    //Antwort prüfen, ob ein xml-Object mit einem Challenge-Tag existiert
    if (!$xml || !$xml->Challenge ) {
        die ("Error: Unerwartete Antwort oder Kommunikationsfehler!\n");
    }
    
    $challenge=(string)$xml->Challenge;
    $sid=(string)$xml->SID;
    if (preg_match("/^[0]+$/",$sid) && $challenge ) {
        
        $sid="";
        //  print "Alte SID --> $sid\n";
        $pass=$challenge."-".$password;
        $pass=mb_convert_encoding($pass, "UTF-16LE");
        $md5 = md5($pass);
        $challenge_response = $challenge."-".$md5;
        $url=$loginurl."?username=".$username."&response=".$challenge_response;
        $http_response = file_get_contents($url);
        //parse Antwort XML
        $xml = simplexml_load_string($http_response);
        $sid=(string)$xml->SID;
        if ((strlen($sid)>0) && !preg_match("/^[0]+$/",$sid)) {
            //is not null, bingo!
            //    print "Http response --> $http_response \n";
            //   print "MD5 Hash --> $md5 \n";
            print $heute." # Neue SID ---> $sid \n";
            return $sid;
            
        }
    }else {
        print $heute." # ACHTUNG::  Else Schleife \n";
        //nutze existierende SID wenn $sid ein hex string ist
        if ((strlen($sid)>0) && (preg_match("/^[0-9a-f]+$/",$sid))) return $sid;
    }
    print $heute." # ACHTUNG:: Null";
    return null;
}
?>