<?php
/*
 * Funktion:
 * Script liest Datenbank alle 15min aus. Wenn eine Uhrzeit == oder <= 15 min zur aktuellen zeit ist, dann die Werte aus der Zeile nehmen
 * und dass heizthermostat Script damit füttern.
 * DB Aufbau -> datum,startuhrzeit, End Uhrzeit, raum ID
 *
 *
 * crontab -e (dbabfrage.php und dbabfrage_enduhrzeit.php)
 * Wird alle 5 min aufgerufen
 * Start entwicklung fbcontrol 29.09.19
 *
 */
include_once ('config_fbcontrol.php');
$heute = date("Y-m-d H:i:s");
$db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);
if (! $db) {
    exit("Verbindungsfehler: " . mysqli_connect_error()) . \n;
}

print $heute . " # Verbindung hergestellt dbabfrage \n";

// Alle Heizkörper um 23:00 Uhr ausschalten


//Aktuelle Zeit umrechnen in Sekunden
$time_hours = date("H") *60 *60;
$time_minutes = date("i") *60;
$time_seconds = date("s");
$timeseconds = $time_hours + $time_minutes + $time_seconds;
//print $heute . " # time --> ".$timeseconds."\n";

/*
 * //TODO Termin deaktiviert Funktion
//Funktion noch nicht fertig!
// Termin deaktiviert, aber Wöchentliche weiterlaufen lassen (Ohne schalten)
// Ferien=1 -> Termin soll in den ferien nicht stattfinden, Ferien=2 -> Termin soll einmal übersprungen werden, Ferien=3 -> Termin soll zweimal übersprungen werden, Ferien=4 Termin soll bis auf widerruf übersprungen werden
$sql_termin_ueberspringen_ID = mysqli_query($db, "SELECT `int_id` FROM `controlv3` WHERE `datum` = CURRENT_DATE AND `Ferien` != 2 ");
$sql_termin_ueberspringen = mysqli_query($db, "SELECT `woechentlich` FROM `controlv3` WHERE `int_id` =  $sql_termin_ueberspringen_ID");

if($sql_termin_ueberspringen == 1){
    mysqli_query($db, "UPDATE `controlv3` SET `datum`=DATE_ADD(datum, INTERVAL 7 DAY) WHERE `int_id` = $sql_conflict_id ");
    mysqli_query($db, "UPDATE `controlv3` SET `starterledigt`= 2 WHERE `int_id` = $sql_conflict_id ");
    mysqli_query($db, "UPDATE `controlv3` SET `enderledigt`= 2 WHERE `int_id` = $sql_conflict_id ");
    print $heute." # Termin erfolgreich verarbeitet\n";
}

*/

if ($timeseconds >= 82800 && $timeseconds <= 83100) {
    print $heute . " # If funktion nightsetoff \n";
    nightsetoff($ain1, $ain2, $ain3, $ain4, $ain5, $ain6, $ain7);
}

// bis 15min in der vergangenheit //changed, Versuch bis 45 min in der Zukunft als Aufheizzeit
$sql_1 = mysqli_query($db, "SELECT `int_id` FROM `controlv3` WHERE `datum` = CURRENT_DATE AND ((TIME_TO_SEC(NOW()) - TIME_TO_SEC(`startuhrzeit`)) <= 0 AND (TIME_TO_SEC(NOW()) - TIME_TO_SEC(`startuhrzeit`)) >= -2700) AND `starterledigt` = 2 ");

print $heute . " # Kurz vor Start while \n";

// While Start mit Bedingung erste Select Anfrage
while ($sql_2 = mysqli_fetch_object($sql_1)) {
    $sql_id = $sql_2->int_id;
    print $heute . " # Start mit ID --->" . $sql_id . "\n";
    $sql_3 = mysqli_query($db, "SELECT `raum` FROM `controlv3` WHERE `int_id` =  $sql_id");
    $sql_raumid = mysqli_fetch_object($sql_3)->raum;
    print $heute . " # Id -->" . $sql_id . "\n";

    print $heute . " # Raum ID -->" . $sql_raumid . "\n";
    print $heute . " # Ende while schleife\n";

    conflicttime($sql_raumid, $sql_id, $sql_3);
    settemperature($sql_raumid, $sql_id);
    
    sleep(2);
    print $heute . " # Ende dbabfrage Funktionen erreicht\n";
}

print $heute . " # Ende erreicht\n";

exit();
?>


<?php

function settemperature($sql_raumid, $sql_id)
// Übermitteln der Soll Temperatur an die Raum-Gruppen ID
{
    // Anmeldedaten und SessionID Funktion einbinden
    include ('config_fbcontrol.php');
    $heute = date("Y-m-d H:i:s");
    print $heute . " # Start settemperature\n";
    $username = $fb_username;
    $password = $fb_password;
    $loginurl = $fb_loginurl;
    $ahaurl = $fb_ahaurl;

    include_once ('SIDauslesen.php');

    //Zuordnung der individuellen Raum Solltemperaturen
    // Anpassen 10.1
    if($sql_raumid == $ain1){    
       $var = $var1;
    }
    if($sql_raumid == $ain2){
        $var = $var2;
    }
    if($sql_raumid == $ain3){
        $var = $var3;
    }
    if($sql_raumid == $ain4){
        $var = $var4;
    }
    if($sql_raumid == $ain5){
        $var = $var5;
    }
    if($sql_raumid == $ain6){
        $var = $var6;
    }
    if($sql_raumid == $ain7){
        $var = $var7;
    }
    
    
    // ---- Soll Temp einstellen ----
    $ain = $sql_raumid; // hier die AIN-Raumid des eigenen Gerätes eintragen
    $id = $sql_id;
    $cmdsend = "gettemperature";
    $sid = get_sid($loginurl, $username, $password);
    if (! $sid) {
        die("Anmeldefehler, keine Session-ID erhalten!\n");
    }

    // sendtemp function

    $db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);
    $cmd = "sethkrtsoll";
   // $var = "43";
    $url = $ahaurl . "?sid=$sid" . "&ain=" . $ain . '&switchcmd=' . $cmd . '&param=' . $var;
    print $heute . " # Sende Kommando zu AIN $ain: \n";
    print $heute . " # URL --> $url \n";
    print $heute . " # Sid in der sendtemp funktion --> $sid \n";
    file_get_contents($url);
    mysqli_query($db, "UPDATE `controlv3` SET `starterledigt`= 1 WHERE `int_id` = $id ");
    print $heute . " # ENDE mit ID ---> " . $id . "\n";

    // Ende sendtemp function

    print $heute . " # Ende set Temperature\n";
    // exit();
    return;
}

function conflicttime($sql_raumid, $sql_id, $sql_3)
// Ermitteln ob es einen Überschneidungs Schaltzeitpunkt "enduhrzeit" gibt
{
    include ('config_fbcontrol.php');
    $db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);
    $heute = date("Y-m-d H:i:s");
    
    $id = $sql_id;
    $raumid = $sql_raumid;
    
    print $heute . " # Start Conflicttime\n";
    $conflicttimestart = mysqli_query($db, "SELECT `startuhrzeit` FROM `controlv3` WHERE `int_id` = " . $id);
    $conflicttimestart_int = mysqli_fetch_object($conflicttimestart)->startuhrzeit;
    print $heute . " # Conflictstart_int --> " . $conflicttimestart_int . "\n";
    print $heute . " # ID --> " . $sql_id . "\n";
    print $heute . " # ID --> " . $raumid . "\n";
    
//TODO: "enduhrzeit > startuhrzeit" mit einbauen. Weitere Merkmale hinzufügen
//TODO Termine die über einen Tageswechsel laufen (bsp. 23:00 - 02:00)
    $conflict_id = mysqli_query($db, "SELECT `int_id` FROM `controlv3` WHERE `datum` = CURRENT_DATE AND `enderledigt` = 2 AND `starterledigt` = 1 AND `raum` = '$raumid' ");
    // $conflict_id = mysqli_query($db, "SELECT `int_id` FROM `controlv3` WHERE `datum` = CURRENT_DATE AND `enderledigt` = 2 AND `starterledigt` = 1 AND `raum` =" . $raumid . "AND `enduhrzeit` >= ".$conflicttimestart);
    
/*
    if (! $conflict_id)
    {
        print $heute . " # Keine Conflict ID \n";
        return;
    }
  */  
    if ($conflict_id->num_rows >= 1) {
        print $heute . " # true \n";
        $conflictid_int = mysqli_fetch_object($conflict_id)->int_id;
        print $heute . " # Conflict ID --> " . $conflictid_int . "\n";
        conflicttimedelete($conflictid_int);
    } else {
        print $heute . " # false, kein Conflict gefunden\n";
    }
    print $heute . " # Ende Conflicttime\n";
}

function conflicttimedelete($conflictid_int)
// Deaktivieren des Konfliktzeitpunktes "enduhrzeit" über "enderledigt"
{
    include ('config_fbcontrol.php');
    $db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);
    $heute = date("Y-m-d H:i:s");

    print $heute . " # Start conflicttimedelete \n";
    mysqli_query($db, "UPDATE `controlv3` SET `enderledigt`= 3 WHERE `int_id` = $conflictid_int ");
    print $heute . " # Conflict ID Enduhrzeit --> " . $conflictid_int . " - wurde erfolgreich gelöscht \n";
    print $heute . " # Ende conflicttimedelete \n";
    // exit();
}

function nightsetoff($ain1, $ain2, $ain3, $ain4, $ain5, $ain6, $ain7)
// Alle Heizkörper um 23:00 Uhr ausschalten
{
    include ('config_fbcontrol.php');
    include_once ('SIDauslesen.php');
    $sid = get_sid($loginurl, $username, $password);
    $db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);
    $heute = date("Y-m-d H:i:s");
    $var = "33";
    $cmd = "sethkrtsoll";
// Anpassen 10.3
    $url_jugendraum = $ahaurl . "?sid=$sid" . "&ain=" . $ain1 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_jugendraum);
    print $heute . " # Night set off --> " . $ain1 . "erledigt \n";
    sleep(2);
    $url_saal = $ahaurl . "?sid=$sid" . "&ain=" . $ain2 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_saal);
    print $heute . " # Night set off --> " . $ain2 . "erledigt \n";
    sleep(2);
    $url_musikzimmer = $ahaurl . "?sid=$sid" . "&ain=" . $ain3 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_musikzimmer);
    print $heute . " # Night set off --> " . $ain3 . "erledigt \n";
    sleep(2);
    $url_duetundat = $ahaurl . "?sid=$sid" . "&ain=" . $ain4 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_duetundat);
    print $heute . " # Night set off --> " . $ain4 . "erledigt \n";
    sleep(2);
    $url_flur = $ahaurl . "?sid=$sid" . "&ain=" . $ain5 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_flur);
    print $heute . " # Night set off --> " . $ain5 . "erledigt \n";
    sleep(2);
    $url_chiliraum = $ahaurl . "?sid=$sid" . "&ain=" . $ain6 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_chiliraum);
    print $heute . " # Night set off --> " . $ain6 . "erledigt \n";
    sleep(2);
    $url_kigoraum = $ahaurl . "?sid=$sid" . "&ain=" . $ain7 . '&switchcmd=' . $cmd . '&param=' . $var;
    file_get_contents($url_kigoraum);
    print $heute . " # Night set off --> " . $ain7 . "erledigt \n";
    sleep(2);
}

?>



  


    
    
    


    
