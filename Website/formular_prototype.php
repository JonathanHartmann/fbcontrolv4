<?php
// TODO: Nur die Eintr�ge bis 1 Monat zur�ck anzeigen lassen
// TODO: Flur + WC�s als Raum hinzuf�gen
require 'dbv2.php';

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

    // If Funktion Raumdesc hinzuf�gen

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
        header('Location: formular_prototype.php?aktion=feedbackgespeichert');
        $int_id ++;
        file_put_contents("counter.txt", $int_id);
        echo /** @lang text */
        "<h1>saved</h1>";
        die();
    } else {
        echo "ERROR_01";
    }
}
if (isset($_GET['aktion']) and $_GET['aktion'] == 'feedbackgespeichert') {
    echo /** @lang text */
    '<p class="feedbackerfolg">Data saved successfully</p>';
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

<?php
$columns = array('Int_id', 'Raum', 'Veranstaltung', 'Ansprechperson', 'Datum', 'Startuhrzeit', 'Enduhrzeit', 'Starterledigt', 'Enderledigt');

$column = isset($_GET['column']) && in_array($_GET['column'], $columns) ? $_GET['column'] : $columns[0];

$sort_order = isset($_GET['order']) && strtolower($_GET['order']) == 'desc' ? 'DESC' : 'ASC';

if ($result = $db->query('SELECT * FROM controlv2 ORDER BY ' . $column . ' ' . $sort_order)) {

    $up_or_down = str_replace(array('ASC', 'DESC'), array('up', 'down'), $sort_order);
    $asc_or_desc = $sort_order == 'ASC' ? 'desc' : 'asc';

?>
<!DOCTYPE html>
<html lang="de">
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
<script src="https://www.w3schools.com/lib/w3.js"></script>
<link href='https://fonts.googleapis.com/css?family=Droid+Serif|Oswald'
	rel='stylesheet' type='text/css'>
<link type="text/css" href="style.css" rel="stylesheet" media="screen" />
<title>Raumplanung Prototype</title>
<link rel="shortcut icon" href="">
<style>
table {
	width: 1200px;
	margin-left: 40px;
}

th {
	background-color: #666;
	color: #fff;
    white-space: nowrap;
    margin-left: 10px;
    margin-right: 10px;
    padding-left: 15px;
    padding-right: 15px;
}

tr {
	background-color: #fffbf0;
	color: #000;
}

tr:nth-child(odd) {
	background-color: #e4ebf2;
}

</style>
<!-- Topnavigation -->
<div id="topnav">
	<ul>
		<li><a href="/Raum/formular.php">Zur&uuml;ck zur Startseite</a></li>
		<li><a href="#">Raum Planung v1</a></li>
		<li><a href="/Raum/formular.php">Raum Planung v2 </a></li>
		<li><a href="/Raum/changelog.php">Changelog </a></li>
		<li><a href="/Raum/formular_develop.php">Raum Planung Entwicklung </a></li>
		<li><b><u><a href="/Raum/formular_prototype.php">Raum Planung Prototype </a></u></b></li>
		<li><a href="/Raum/calendar.php">Kalendar </a></li>
	</ul>
</div>
<div id="wrapperr">

    <form action="" method="post">
	<br> <b>Raum:</b> <label>
            <select name="raum" size="1">

                <option value="099950180156">WC Behinderte</option>
                <option value="01:3E:8F-900">Saal</option>
                <option value="01:3E:8F-904">Jugendraum</option>
                <option value="01:3E:8F-901">Düt & Dat</option>
                <option value="01:3E:8F-902">Kigo-Raum</option>
                <option value="01:3E:8F-907">Chili-Raum</option>
                <option value="01:3E:8F-906">Musikzimmer</option>
                <option value="01:3E:8F-903">Flur Wcs, Nicht nutzen</option>

            </select>
        </label>
    <label>Veranstaltung: <input type="text" name="veranstaltung"
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
	<p>Raum Id's: 900/Saal ; 901/D&uuml;tunDat ; 902/Kigo-Raum ;
		904/Jugendraum ; 906/Musikzimmer ; 907/Chili-Raum</p>
</form>
</div>
<table id="roomplan">

        <tr>
            <th><a href="controlv2.php?column=Int_id&order=<?php echo $asc_or_desc; ?>">ID<i class="fas fa-sort<?php echo $column == 'Int_id' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=raum&order=<?php echo $asc_or_desc; ?>">Raum<i class="fas fa-sort<?php echo $column == 'raum' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=veranstaltung&order=<?php echo $asc_or_desc; ?>">Veranstaltung<i class="fas fa-sort<?php echo $column == 'veranstaltung' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=ansprechperson&order=<?php echo $asc_or_desc; ?>">Ansprechperson<i class="fas fa-sort<?php echo $column == 'ansprechperson' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=datum&order=<?php echo $asc_or_desc; ?>">Datum<i class="fas fa-sort<?php echo $column == 'datum' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=startuhrzeit&order=<?php echo $asc_or_desc; ?>">Startuhrzeit<i class="fas fa-sort<?php echo $column == 'startuhrzeit' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=enduhrzeit&order=<?php echo $asc_or_desc; ?>">Enduhrzeit<i class="fas fa-sort<?php echo $column == 'enduhrzeit' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=starterledigt&order=<?php echo $asc_or_desc; ?>">Starterledigt<i class="fas fa-sort<?php echo $column == 'starterledigt' ? '-' . $up_or_down : ''; ?>"></i></a></th>
            <th><a href="controlv2.php?column=enderledigt&order=<?php echo $asc_or_desc; ?>">Enderledigt<i class="fas fa-sort<?php echo $column == 'enderledigt' ? '-' . $up_or_down : ''; ?>"></i></a></th>
        </tr>
    <?php while ($row = $result->fetch_assoc()): ?>
        <tr>
			<td<?php echo $column == 'Int_id'; ?>><?php echo $row['Int_id']; ?></td>
			<td<?php echo $column == 'raum'; ?>><?php echo $row['raum']; ?></td>
			<td<?php echo $column == 'veranstaltung'; ?>><?php echo $row['veranstaltung']; ?></td>
			<td<?php echo $column == 'ansprechperson'; ?>><?php echo $row['ansprechperson']; ?></td>
			<td<?php echo $column == 'datum'; ?>><?php echo $row['datum']; ?></td>
			<td<?php echo $column == 'startuhrzeit'; ?>><?php echo $row['startuhrzeit']; ?></td>
			<td<?php echo $column == 'enduhrzeit'; ?>><?php echo $row['enduhrzeit']; ?></td>
			<td<?php echo $column == 'starterledigt'; ?>><?php echo $row['starterledigt']; ?></td>
			<td<?php echo $column == 'enderledigt'; ?>><?php echo $row['enderledigt']; ?></td>
		</tr>
    <?php endwhile; ?>
</table>

<?php
    $result->free();
}
?>
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
    //Wenn gestartet aber nicht zu ende, Farbe leicht grün
    if ($num1 == 1 && $num2 == 2){
        return '#A5FF74';
    }
    //Wenn gestartet und beendet, Farbe leicht blau(?)
    else if($num1 == 1 && $num2 == 1){
        return '#A174FF';
    }
    else {
        return '#fffbf0';
    }
}
?>