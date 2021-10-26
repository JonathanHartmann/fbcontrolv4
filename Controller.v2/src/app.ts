import dotenv from 'dotenv';
import { IEvent } from './interfaces/event.interface';
import { IRoom } from './interfaces/room.interface';
import { SIDService } from './services/file.service';
import { FirebaseService } from './services/firebase.service';
import { FritzService } from './services/fritz.service';
import { EventService } from './services/event.service';
dotenv.config();


const start = () => {
  FirebaseService.loadEvents().then(events => {
    const filteredEvents = events.filter(e => !e.background);
    getRoomsMap().then(roomsMap => {
      checkEvents(filteredEvents, roomsMap);
    });
  });
};

const checkEvents = (events: IEvent[], roomsMap: Map<string, IRoom>) => {
  console.log(new Date().toISOString(), ' - Start check...');
  SIDService.readSIDFile(async function (err, sid) {
    if (err) {
      console.error('Could not read sid.txt! ', err);

    } else if (sid.length !== 16) {
      console.log('lenght of SID not correct!');
    SIDService.requestNewSID();

    } else {
      const eventsEnh = await EventService.getEnhancedEvents(events, roomsMap);
      EventService.checkTimes(eventsEnh, roomsMap,
        (room, event) => {
          // Before the event
          FirebaseService.updateRoom({...room, heated: true, cooled: false});
          FritzService.heatUpRoom(room, sid);
        },
        (room, event) => {
          // After the event
          FirebaseService.updateRoom({...room, heated: false, cooled: true});
          FritzService.coolDownRoom(room, sid);
          if (event?.seriesEndless && event.seriesId) {
            console.log('try to create new event');
            FirebaseService.appendEndlessEvent(events, event.seriesId);
          }
        }
      );
    }
    console.log(new Date().toISOString(), ' - Check ended');
  });
}

const getRoomsMap = async (): Promise<Map<string, IRoom>> => {
  const roomsArr = await FirebaseService.loadRooms();
  const roomsMap = new Map<string, IRoom>();
  roomsArr.forEach(r => roomsMap.set(r.id, r));
  return roomsMap;
}

start();