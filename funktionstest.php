<?php
//Funktionstest
include_once('SIDauslesen.php');
$SID=get_sid($loginurl,$username,$password) ;
if ($SID) {
  echo "Session-ID: ".$SID."\n" ;
}else{
  echo "Anmeldefehler, keine Session-ID erhalten!\n";
}
?>
