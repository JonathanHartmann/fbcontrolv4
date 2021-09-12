import http from 'http';
import dotenv from 'dotenv';

import { IEvent } from './interfaces/event.interface';
import { IRoom } from './interfaces/room.interface';
import { SIDService } from './services/file.service';
import { FirebaseService } from './services/firebase.service';
import { FritzService } from './services/fritz.service';
import { EventService } from './services/event.service';
dotenv.config();

const hostname = '127.0.0.1';
const port = 3000;
const intervalTime = Number(process.env.CHECK_INTERVAL_TIME); // in seconds


const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World');
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
  const checkIntervalTime = intervalTime * 1000
  console.log(`Checking events every ${checkIntervalTime / 1000} seconds`);
  const eventService = new EventService();
  setInterval(() => {
    FirebaseService.loadEvents().then(events => {
      const filteredEvents = events.filter(e => !e.background);
      getRoomsMap().then(roomsMap => {
        checkEvents(filteredEvents, roomsMap, eventService);
      });
    });
  }, checkIntervalTime);
});

function checkEvents(events: IEvent[], roomsMap: Map<string, IRoom>, eventService: EventService) {
  console.log(new Date().toISOString(), ' - Start check...');
  SIDService.readSIDFile(async function (err, sid) {
    console.log('SID:', sid);
    console.log('SID:', sid.length);
    if (err) {
      console.error('Could not read sid.txt! ', err);

    } else if (sid.length !== 16) {
      SIDService.requestNewSID();

    } else {
      const eventsEnh = await EventService.getEnhancedEvents(events, roomsMap);
      eventService.checkTimes(eventsEnh,
        (room, event) => {
          // Before the event
          FritzService.heatUpRoom(room, sid);
        },
        (room, event) => {
          // After the event
          FritzService.coolDownRoom(room, sid);+
          console.log('name', event?.title, 'endless?', event?.seriesEndless, ' - id:', event?.seriesId);
          if (event?.seriesEndless && event.seriesId) {
            console.log('try to create new evetn');
            FirebaseService.appendEndlessEvent(events, event.seriesId);
          }
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