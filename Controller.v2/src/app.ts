import dotenv from 'dotenv';
import { IEvent } from './interfaces/event.interface';
import { IRoom } from './interfaces/room.interface';
import { SIDService } from './services/file.service';
import { FirebaseService } from './services/firebase.service';
import { FritzService } from './services/fritz.service';
import { EventService } from './services/event.service';
dotenv.config();


const TIME_AFTER_REQUEST = 1000;      // in ms



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

      // Get the rooms that need to be heated up or cooled down
      const { heatUpRooms, coolDownRooms } = EventService.checkTimes(eventsEnh, roomsMap);

      // Call up the Fritzbox command for each room. The timeout is important so that the Fritzbox is not overloaded.
      heatUpRooms.forEach(({ room }, i) => {
        setTimeout(() => {
          FirebaseService.updateRoom({ ...room, heated: true, cooled: false });
          FritzService.heatUpRoom(room, sid);
        }, i * TIME_AFTER_REQUEST);
      });

      // Call up the Fritzbox command for each room. The timeout is important so that the Fritzbox is not overloaded.
      coolDownRooms.forEach(({ room, event }, i) => {
        setTimeout(() => {
          FirebaseService.updateRoom({ ...room, heated: false, cooled: true });
          FritzService.coolDownRoom(room, sid);
          // If the event was an endless appointment, create a new one in a year.
          if (event?.seriesEndless && event.seriesId) {
            console.log('try to create new event');
            FirebaseService.appendEndlessEvent(event.seriesId);
          }
        }, i * TIME_AFTER_REQUEST);
      });

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