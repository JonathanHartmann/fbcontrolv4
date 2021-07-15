<?php
//Anmeldedaten und SessionID Funktion einbinden
include_once('SIDauslesen.php');

//----   Test Switch Actor ----
$ain="08761 0123456"; //hier die AIN des eigenen Gerätes eintragen
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
  file_get_contents($url);
}
?>