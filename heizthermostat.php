<?php
//Anmeldedaten und SessionID Funktion einbinden
include_once('SIDauslesen.php');


/*----   Test Switch Actor ----
$ain="099950178607"; //hier die AIN des eigenen Gerätes eintragen
$action=false; //Gerät ausschalten, true zum Einschalten
$sid=get_sid($loginurl,$username,$password);
if (!$sid ) {
  die ("Anmeldefehler, keine Session-ID erhalten!\n");
}
switch_power($ahaurl,$sid,$ain,$action);

function switch_power($ahaurl,$sid,$ain,$action) {
  $cmd=($action==true)?'setswitchon':'setswitchoff';
  $url=$ahaurl."?sid=$sid"."&ain=".rawurlencode($ain).'&switchcmd='.$cmd;
  print "Sende Kommando zu AIN $ain: $cmd\n";
  //es wird keine Antwort erwartet, Fehler werden als Warnung ausgegeben
 // file_get_contents($url);
}
*/

//----   Soll Temp einstellen ----
$ain="099950178607"; //hier die AIN des eigenen Gerätes eintragen
$cmdsend="gettemperature";
$action=false; //Gerät ausschalten, true zum Einschalten
$sid=get_sid($loginurl,$username,$password);
if (!$sid ) {
    die ("Anmeldefehler, keine Session-ID erhalten!\n");
}
sendtemp($ahaurl,$sid,$ain,$action);

function sendtemp($ahaurl,$sid,$ain,$action) {
    
    $cmd="sethkrtsoll";
    $var="50";
    $url=$ahaurl."?sid=$sid"."&ain=".rawurlencode($ain).'&switchcmd='.$cmd.'&param='.$var;
    print "Sende Kommando zu AIN $ain: \n";
    print "URL --> $url \n";
    print "Sid --> $sid \n";
   file_get_contents($url);
}



?>

