<?php
//Anmeldedaten und SessionID Funktion einbinden
include_once('SIDauslesen.php');

//Login in Fritzbox und SID ermitteln
$sid=get_sid($loginurl,$username,$password);
if (!$sid ) {
  die ("Anmeldefehler, keine Session-ID erhalten!\n");
}
//SmarthomeURL mit SID Parameter ergänzen
$query_url=$ahaurl.'?sid='.$sid;
//Abfrage aller eingetragenen Geräte mit getdevicelistinfo Kommando
$xmlstring=chop(@file_get_contents($query_url."&switchcmd=getdevicelistinfos"));
$xml = @simplexml_load_string($xmlstring);
//Antwort prüfen, ob ein xml-Object mit einem Device-Tag existiert
if (!$xml || !$xml->device ) {
  die ("Error: Unerwartete Antwort oder Komunikationsfehler bei cmd=getdevicelistinfos");
}
//Schleife über alle gelisteten Geräte
foreach ($xml->device as $device) {
  $attributes=$device->attributes();
  $ain=(string)$attributes['identifier']; //Lese Geräte AIN
  $name=(string)$device->name; //lese Gerätename
  $txt="AIN $ain ($name) ";

  //Check Funktionsbitmask
  $mask=(integer)$attributes['functionbitmask'];
  $has_temperatur=($mask & (1<<8))>0;
  $has_switch=($mask & (1<<9))>0;

  //Behandle Funktionen
    if ($has_temperatur) {
      //bit8=Temperatur Sensor
      $temperatur=((integer)$device->temperature->celsius)/10;
      $offset=((integer)$device->temperature->offset)/10;
      $temperatur=$temperatur+$offset;
      $txt.=sprintf (" Temperatur:(Temp:%02.1fC, Offset:%02.1f) ;",$temperatur,$offset);
    }
  if ($has_switch) {
    //bit9=schaltbare Steckdose
      $status=(string)$device->switch->state;
      $status=($status=="1");
      $txt.= " Steckdose(Status:".($status?"On":"Off")."); ";
  }
  //... weitere Funktionen
  print $txt. "\n";
}
//$query_url=$ahaurl.'?sid='.$sid;
//Abfrage aller eingetragenen Geräte mit getdevicelistinfo Kommando
//$xmlstring=chop(@file_get_contents($query_url."&switchcmd=getdevicelistinfos"));
//$xml = @simplexml_load_string($xmlstring);
print $xmlstring
?>
