import http from 'http';
import dotenv from 'dotenv';

import { IEvent } from './interfaces/event.interface';
import { IRoom } from './interfaces/room.interface';
import { SIDService } from './services/file.service';
import { FirebaseService } from './services/firebase.service';
import { FritzService } from './services/fritz.service';
import { EventService } from './services/event.service';

const hostname = '127.0.0.1';
const port = 3000;
const intervalTime = Number(process.env.CHECK_INTERVAL_TIME); // in seconds

dotenv.config();

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  setInterval(() => {
    FirebaseService.loadEvents().then(events => {
      const filteredEvents = events.filter(e => !e.background);
      getRoomsMap().then(roomsMap => {
        checkEvents(filteredEvents, roomsMap);
      });
    });
  }, intervalTime * 1000);
});

function checkEvents(events: IEvent[], roomsMap: Map<string, IRoom>) {
  console.log(new Date().toISOString(), ' - Start check...');
  SIDService.readSIDFile(async function (err, sid) {
    if (err) {
      console.error('Could not read sid.txt! ', err);

    } else if (sid.length !== 16) {
      SIDService.requestNewSID();

    } else {
      const eventsEnh = await EventService.getEnhancedEvents(events, roomsMap);
      EventService.checkTimes(eventsEnh,
        (event) => {
          if (event.room) {
            FritzService.heatUpRoom(event.room, sid);
          };
        },
        (event) => {
          if (event.room) {
            FritzService.coolDownRoom(event.room, sid);
          };
        }
      );
    }
    console.log(new Date().toISOString(), ' - Check ended');
  });
}

async function getRoomsMap(): Promise<Map<string, IRoom>> {
  const roomsArr = await FirebaseService.loadRooms();
  const roomsMap = new Map<string, IRoom>();
  roomsArr.forEach(r => roomsMap.set(r.id, r));
  return roomsMap;
}