# fbcontrolv4
Heizungssteuerung.v4

Heizkörper in verschiedenen Räumen eines Gebäudes zu unregelmäßigen Zeiten schalten. 
DEMO -> https://demo.gigarocket.de

Die meisten Heizkörper-Thermostate können mit ihrer Standard-Programmierung wöchentliche Termine problemlos abbilden. Bei außerordentlichen einmaligen Terminen, wie sie im Vereins- oder kirchlichen Bereich oft vorkommen, können damit nicht realisiert werden. 
## Features
Diese Software vereint die SmartHome Features der AVM Heizthermostate "Dect 301", mit einem Kalender zur Raumbuchung eines Gebäudes. 
· Kalender zur Visualisierung von Terminen und Räumen
· Anlegen von Räumen mit Komforttemperatur, Absenktemperatur, Aufheizzeit, Fritz-AIN
· Automatische Beheizung der Räume entsprechend der Termine & Aufheizzeiten
· Verschiedene Ansichten: Monat,Woche,Tag
· Serientermine
· Einmalige Termine
· User Verwaltung
· Implementierung von Ferien & Feiertagen



## Module
Die Software besteht aus 3 Haupt-Modulen:
· Frontend -> Website zur Visualisierung sowie Verwaltung der Termine in einem Kalender.
· Datenbank -> Firebase
· Controller -> Aktives Bindeglied zwischen Datenbank und FritzBox 

## Funktionsweise
Die Termine können über den Kalender auf der Website eingetragen und verwaltet werden.
Der Controller prüft fortlaufend, ob ein Raum für einen Termin geheizt werden muss. 
Dieser schickt dann ein HTTP-Request an die FritzBox welche die Heizkörper-Thermostate auf die gewünschte Temperatur einstellt.

## Setup
1. setup Firebase & config
2. Website.V2 run npm install 
3. Website.V2 run npm build
4. setup Controller.V2 to run as cronjob
5. open Website and adjust the rooms
6. enjoy



## Footer
Projekt-Initiator & Author: Jonathan Hartmann 
Author: Till Hoffmann https://github.com/tillhoffmann1411 
Kontakt: heizungssteuerung[at]gigarocket.de 
Copyright(c): 2022 Jonathan Hartmann

Die Basis der Heizungssteuerung ist die "AVM Home Automation". Infos hier: https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AHA-HTTP-Interface.pdf
sowie 
https://fullcalendar.io/  (MIT license)

Keywords:
Heizungssteuerung , Gemeindehaus , Heizungssteuerung mit Kalender , Kalender Raumbuchung , Fritzbox Heizungssteuerung, Heizkörper automatisch schalten , 