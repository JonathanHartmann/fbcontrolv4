# fbcontrolv4
Heizungssteuerung.v4

Ziel dieses Projektes soll sein, �ber einen Kalendar der Online �ber eine Website verf�gbar ist, Termine eintragen zu k�nnen.
Durch die Eintragung der Termine wird automatisch die Heizung(nat�rlich nur in der Heizsaison) auf die Soll temperatur eingestellt. 

Die API der Heizungssteuerung ist die "AVM Home Automation" �ber ein HTTP GET Request. 
Infos hier: https://avm.de/fileadmin/user_upload/Global/Service/Schnittstellen/AHA-HTTP-Interface.pdf

Die Programmierung der Background Steuerung ist komplett in PHP geschrieben.

Die Website dient dabei als UI f�r den Benutzer. Um Einstellungen einfach t�tigen zu k�nnen.



# Website V2
## 🚀 Setup
1. Clone this repo
2. Run `npm install`
3. Add a .env file which looks like the .env.example file
4. Start development with `npm start`
5. Get files for production with `npm run build`. Your files are now in the /public folder.