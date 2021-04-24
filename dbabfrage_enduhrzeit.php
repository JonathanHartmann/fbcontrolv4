<?php
/*
 * Funktion:
 * Script liest Datenbank alle 15min aus. Wenn eine Uhrzeit == oder <= 15 min zur aktuellen zeit ist, dann die Werte aus der Zeile nehmen
 * und dass heizthermostat Script damit fuettern.
 * DB Aufbau -> datum,enduhrzeit, End Uhrzeit, raum ID
 *
 */
include ('config_fbcontrol.php');
$heute = date("Y-m-d H:i:s"); 
$db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);

if (! $db) {
    exit("Verbindungsfehler: " . mysqli_connect_error()) . \n;
}

print $heute." # Verbindung hergestellt dbabfrage_enduhrzeit \n";

// bis 15min in der vergangenheit
$sql_1 = mysqli_query($db, "SELECT `int_id` FROM `controlv3` WHERE `datum` = CURRENT_DATE AND ((TIME_TO_SEC(NOW()) - TIME_TO_SEC(`enduhrzeit`)) <= 900 AND (TIME_TO_SEC(NOW()) - TIME_TO_SEC(`enduhrzeit`)) >= 0) AND `enderledigt` = 2 ");
$sql_conflict_1 = mysqli_query($db, "SELECT `int_id` FROM `controlv3` WHERE `datum` = CURRENT_DATE AND ((TIME_TO_SEC(NOW()) - TIME_TO_SEC(`enduhrzeit`)) <= 900 AND (TIME_TO_SEC(NOW()) - TIME_TO_SEC(`enduhrzeit`)) >= 0) AND `enderledigt` = 3 ");
print $heute." # Kurz vor Start while \n";

// While Start mit Bedingung erste Select Anfrage
while ($sql_2 = mysqli_fetch_object($sql_1)) {
    $sql_id = $sql_2->int_id;
    print("\n");
    print $heute." # Start mit ID --->" . $sql_id . "\n";
    $sql_3 = mysqli_query($db, "SELECT `raum` FROM `controlv3` WHERE `int_id` =  $sql_id");
    $sql_raumid = mysqli_fetch_object($sql_3)->raum;
    print $heute." # Id -->" . $sql_id . "\n";
    print $heute." # Raum --> " . $sql_raumid . "\n";

    //echo $sql_2->int_id;
   
    print $heute." # Raum Angezeigt\n";
    print $heute." # Raum ID -->" . $sql_raumid . "  |\n";
    print $heute." # Ende while schleife\n";

    // $raumid = $row->raum;
    // $raumid = $raum ;
    settemperature($sql_raumid, $sql_id);
    sleep(2);
}

//While Schleife für wöchentliche Konflikt Termine
while ($sql_conflict_2 = mysqli_fetch_object($sql_conflict_1)) {
    $sql_conflict_id = $sql_conflict_2->int_id;
    print("\n");
    print $heute." # Start mit ID --->" . $sql_conflict_id . "\n";
    $sql_conflict_3 = mysqli_query($db, "SELECT `woechentlich` FROM `controlv3` WHERE `int_id` =  $sql_conflict_id");
    $sql_conflict_woechentlich = mysqli_fetch_object($sql_conflict_3)->woechentlich;
    print $heute." # Id -->" . $sql_conflict_id . "\n";
    print $heute." # Woechentlich true/false --> " . $sql_conflict_woechentlich . "\n";
    
    //echo $sql_2->int_id;
    if($sql_conflict_woechentlich == 1){
        mysqli_query($db, "UPDATE `controlv3` SET `datum`=DATE_ADD(datum, INTERVAL 7 DAY) WHERE `int_id` = $sql_conflict_id ");
        mysqli_query($db, "UPDATE `controlv3` SET `starterledigt`= 2 WHERE `int_id` = $sql_conflict_id ");
        mysqli_query($db, "UPDATE `controlv3` SET `enderledigt`= 2 WHERE `int_id` = $sql_conflict_id ");
        print $heute." # Termin erfolgreich verarbeitet\n";
    }else {
        print $heute." # Error, Konflikt ID wurde gefunden. Kein woechentlicher Termin\n";
        mysqli_query($db, "UPDATE `controlv3` SET `enderledigt`= 1 WHERE `int_id` = $sql_conflict_id ");
        
    }

    print $heute." # Ende while schleife, Konflikt Enduhrzeit Termin\n";
    
}

print $heute." # Ende erreicht\n";

exit();
?>


<?php

function settemperature($sql_raumid, $sql_id)
{
    // Anmeldedaten und SessionID Funktion einbinden
    include ('config_fbcontrol.php');
    $heute = date("Y-m-d H:i:s"); 
    print $heute." # Test STart settemperature\n";
    $username = $fb_username;
    $password = $fb_password;
    $loginurl = $fb_loginurl;
    $ahaurl = $fb_ahaurl;

    include_once ('SIDauslesen.php');

    // ---- Soll Temp einstellen ----
    $ain = $sql_raumid; // hier die AIN-Raumid des eigenen Gerätes eintragen
    $id = $sql_id;
    $cmdsend = "gettemperature";
    $sid = get_sid($loginurl, $username, $password);
    if (! $sid) {
        die("Anmeldefehler, keine Session-ID erhalten!\n");
    }

    // Einfuegen send Temp function

    $db = mysqli_connect($mysql_servername, $mysql_username, $mysql_password, $mysql_db);
    $cmd = "sethkrtsoll";
    $var = "31";
    $url = $ahaurl . "?sid=$sid" . "&ain=" . $ain . '&switchcmd=' . $cmd . '&param=' . $var;
    print $heute." # Sende Kommando zu AIN $ain: \n";
    print $heute." # URL --> $url \n";
    print $heute." # Sid in der sendtemp funktion --> $sid \n";
    file_get_contents($url);

    $woechentlich = mysqli_query($db, "SELECT `woechentlich` FROM `controlv3` WHERE `int_id` =  $sql_id");
    $woechentlich_id = mysqli_fetch_object($woechentlich)->woechentlich;
    print $heute." # ID -->  " . $sql_id . "\n";
    print $heute." # woechentlich true/false  " . $woechentlich_id . "\n";
    if ($woechentlich_id == 1) {
        print $heute." # Start If Funktion Woechentlich" . "\n";
        mysqli_query($db, "UPDATE `controlv3` SET `datum`=DATE_ADD(datum, INTERVAL 7 DAY) WHERE `int_id` = $id ");
        mysqli_query($db, "UPDATE `controlv3` SET `starterledigt`= 2 WHERE `int_id` = $id ");
        // UPDATE `controlv3` SET `datum`=DATE_ADD(datum, INTERVAL 5 DAY) WHERE `woechentlich`=1
    } else {
        print $heute." # Start Else Funktion Nicht Woechentlich" . "\n";
        mysqli_query($db, "UPDATE `controlv3` SET `enderledigt`= 1 WHERE `int_id` = $id ");
        print $heute." # ENDE mit ID ---> " . $id . "\n";
        print "\n";
        return;
        // Ende sendtemp function

        print $heute." # Ende set Temperature\n";
        exit();
    }
}

?>



  


    
    
    


    
