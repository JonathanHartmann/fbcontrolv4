<?php
// TODO: Nur die Eintrï¿½ge bis 1 Monat zurï¿½ck anzeigen lassen
// TODO: Flur + WCï¿½s als Raum hinzufï¿½gen
//TODO: Einzelne Raum Ansicht hinzufügen

?>
<html lang="de">
</html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<link href='https://fonts.googleapis.com/css?family=Droid+Serif|Oswald'
	rel='stylesheet' type='text/css'>
<link type="text/css" href="style.css" rel="stylesheet" media="screen" />
<title>Raumplanung</title>
<link rel="shortcut icon" href="">
<!-- Topnavigation -->
<div id="topnav">
	<ul>
		<li><a href="/Raum/formular.php">Zur&uuml;ck zur Startseite</a></li>
		<li><a href="#">Raum Planung v1</a></li>
		<li><a href="/Raum/formular.php">Raum Planung v2 </a></li>
		<li><a href="/Raum/changelog.php">Changelog </a></li>
		<li><b><u><a href="/Raum/formular_develop.php">Raum Planung Entwicklung </a></u></b></li>
		<li><a href="/Raum/calendar.php">Kalendar </a></li>
	</ul>
</div>
<div id="wrapperr">

</head>
<form action="" method="post">
	<br> <b>Raum:</b> <select name="raum" size="1">
		
		<option value="099950180156">WC Behinderte</option>
		<option value="01:3E:8F-900">Saal</option>
		<option value="01:3E:8F-904">Jugendraum</option>
		<option value="01:3E:8F-901">DÃ¼t & Dat</option>
		<option value="01:3E:8F-902">Kigo-Raum</option>
		<option value="01:3E:8F-907">Chili-Raum</option>
		<option value="01:3E:8F-906">Musikzimmer</option>
		<option value="01:3E:8F-903">Flur Wcs, Nicht nutzen</option>
		
	</select> <label>Veranstaltung: <input type="text" name="veranstaltung"
		id="veranstaltung">
	</label> <label>Ansprechperson: <input type="text"
		name="ansprechperson" id="ansprechperson">
	</label> <label>Datum: <input type="date" value="" name="datum"
		id="datum">
	</label> <label>Startuhrzeit: <input type="time" name="startuhrzeit"
		id="startuhrzeit">
	</label> <label>Enduhrzeit: <input type="time" name="enduhrzeit"
		id="enduhrzeit">
	</label> <input type="hidden" name="aktion" value="speichern"> <input
		type="submit" value="speichern"> <br>
	<p>!!!!NICHT AKTUELL!!!!</p>
</form>
<?php

require 'dbv2.php';
setlocale(LC_TIME, "de_DE");

if (isset($_POST['aktion']) and $_POST['aktion'] == 'speichern') {
    $raum = "";
    if (isset($_POST['raum'])) {
        $raum = trim($_POST['raum']);
    }
    $veranstaltung = "";
    if (isset($_POST['veranstaltung'])) {
        $veranstaltung = trim($_POST['veranstaltung']);
    }
    $ansprechperson = "";
    if (isset($_POST['ansprechperson'])) {
        $ansprechperson = trim($_POST['ansprechperson']);
    }
    $datum = "";
    if (isset($_POST['datum'])) {
        $datum = trim($_POST['datum']);
    }
    $startuhrzeit = "";
    if (isset($_POST['startuhrzeit'])) {
        $startuhrzeit = trim($_POST['startuhrzeit']);
    }
    $enduhrzeit = "";
    if (isset($_POST['enduhrzeit'])) {
        $enduhrzeit = trim($_POST['enduhrzeit']);
    }
    $starterledigt = "";
    if (isset($_POST['starterledigt'])) {
        $starterledigt = trim($_POST['starterledigt']);
    }
    $enderledigt = "";
    if (isset($_POST['enderledigt'])) {
        $enderledigt = trim($_POST['enderledigt']);
    }

    // If Funktion Raumdesc hinzufï¿½gen

    if ($raum == "01:3E:8F-900") {
        $raumdesc = "Saal";
    }
    if ($raum == "01:3E:8F-904") {
        $raumdesc = "Jugendraum";
    }
    if ($raum == "01:3E:8F-901") {
        $raumdesc = "Duet un Dat";
    }
    if ($raum == "01:3E:8F-902") {
        $raumdesc = "Kigo Raum";
    }
    if ($raum == "01:3E:8F-907") {
        $raumdesc = "Chili Raum";
    }
    if ($raum == "01:3E:8F-906") {
        $raumdesc = "Musikzimmer";
    }
    if ($raum == "099950180156") {
        $raumdesc = "WC Behinderte";
    }
    if ($raum == "01:3E:8F-903") {
        $raumdesc = "Flur Wcs";
    }
}

if ($raum != '' and $veranstaltung != '' and $ansprechperson != '' and $datum != '' and $startuhrzeit != '' and $enduhrzeit != '') {
    // speichern
    // $raumdesc = "05";
    $starterledigt = "2";
    $enderledigt = "2";
    $woechentlich = "0";
    $int_id = intval(file_get_contents("counter.txt"));
    $einfuegen = $db->prepare("
                INSERT INTO controlv2 (int_id, raum, veranstaltung, ansprechperson, datum, startuhrzeit, enduhrzeit, starterledigt, enderledigt, woechentlich, raumdesc)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?,?,?)
                ");
    $einfuegen->bind_param('sssssssssss', $int_id, $raum, $veranstaltung, $ansprechperson, $datum, $startuhrzeit, $enduhrzeit, $starterledigt, $enderledigt, $woechentlich, $raumdesc);

    if ($einfuegen->execute()) {
        header('Location: formular_develop.php?aktion=feedbackgespeichert');
        $int_id ++;
        file_put_contents("counter.txt", $int_id);
        die();
        echo "<h1>gespeichert</h1>";
    } else {
        echo "ERROR_01";
    }
}
if (isset($_GET['aktion']) and $_GET['aktion'] == 'feedbackgespeichert') {
    echo '<p class="feedbackerfolg">Datensatz wurde gespeichert</p>';
}
$daten = array();

if ($erg = $db->query("SELECT * FROM controlv2 where to_days(datum) >= (to_days(now())-7) ORDER BY `datum` ASC")) {
    if ($erg->num_rows) {
        while ($datensatz = $erg->fetch_object()) {
            $daten[] = $datensatz;
        }
        $erg->free();
    }
}
if (! count($daten)) {
    echo "<p>Es liegen keine Daten vor :(</p>";
} else {
    ?>
<style>
table {
	width: 1200;
	margin-left: 40;
}

th {
	background-color: #666;
	color: #fff;
   // table angepasst, was die breite und whitespace angeht
    white-space: nowrap;
    margin-left:10;
    margin-right: 10;
}

tr {
	background-color: #fffbf0;
	color: #000;
}

tr:nth-child(odd) {
	background-color: #e4ebf2;
}

</style>
<table>
	<thead>
		<tr>
			<th width=10>Int_id</th>
			<th width=120>Raum</th>
			<th width=250>Veranstaltung</th>
			<th width=250>Ansprechperson</th>
			<th width=40>Datum</th>
			<th width=40>Wochentag</th>
			<th width=40>Startuhrzeit</th>
			<th width=40>Enduhrzeit</th>
			<th width=10>Starterledigt</th>
			<th width=10>Enderledigt</th>
		</tr>
	</thead>
	<tbody>
	
            <?php
    foreach ($daten as $inhalt) {
        ?>
         <?php
         setlocale(LC_TIME, "de");
         // Datums Format ändern
			$datedisplay1 = bereinigen($inhalt->datum);
			$datum_de_wochentag = date(" D ", strToTime($datedisplay1));
			$datum_de = date("d.m.Y ", strToTime($datedisplay1));
		
			 ?>
          <!--     /*  <tr style="backround-color: <?changeColor($inhalt->starterledigt, $inhalt->enderledigt); ?>"> */ -->
        <tr>
			<td><?php echo bereinigen($inhalt->int_id); ?></td>
			<td><?php echo bereinigen($inhalt->raumdesc); ?></td>
			<td><?php echo bereinigen($inhalt->veranstaltung); ?></td>
			<td><?php echo bereinigen($inhalt->ansprechperson); ?></td>
		<!-- 	/* <td><?php echo bereinigen($inhalt->datum); ?></td> , Datumformat geÃ¤ndert */ -->
			<td><?php echo $datum_de; ?></td>
			<td><?php echo $datum_de_wochentag; ?></td>
			<td><?php echo bereinigen($inhalt->startuhrzeit); ?></td>
			<td><?php echo bereinigen($inhalt->enduhrzeit); ?></td>
			<td><?php echo bereinigen($inhalt->starterledigt); ?></td>
			<td><?php echo bereinigen($inhalt->enderledigt); ?></td>
		</tr>
            <?php
    }
    ?>
        </tbody>
</table>
<?php
}

function bereinigen($inhalt = '')
{
    $inhalt = trim($inhalt);
    $inhalt = htmlentities($inhalt, ENT_QUOTES, "UTF-8");
    return ($inhalt);
}

//function zur farblichen trennung
function changeColor($num1, $num2)
{
    //Wenn gestartet aber nicht zu ende, Farbe leicht grÃ¼n
    if ($num1 == 1 && $num2 == 2){
        return '#A5FF74';
    }
    //Wenn gestartet und beendet, Farbe leicht blau(?)
        elseif ($num1 == 1 && $num2 == 1){
        return '#A174FF';
        }
        
}

?>
