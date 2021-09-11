import { IEnhancedEvent, IEvent } from '../interfaces/event.interface';
import { IRoom } from '../interfaces/room.interface';

export class EventService {
  heatingUpRooms: Map<string, IRoom> = new Map();
  coolRooms: Map<string, IRoom> = new Map();


  static async getEnhancedEvents(events: IEvent[], roomsMap: Map<string, IRoom>): Promise<IEnhancedEvent[]> {
    const eventsRoom = events.map(e => {
      const room = roomsMap.get(e.roomId);
      const startsIn = 0;
      const endedIn = 0;
      return {event: e, startsIn, endedIn, room};
    })
    const eventsEnh = EventService.updateTimes(eventsRoom);
    return eventsEnh;
  }
  
  static updateTimes(events: IEnhancedEvent[]): IEnhancedEvent[] {
    return events.map(e => {
      const startsIn = Math.round(((e.event.start.toMillis() - Date.now()) / 60000) * 100) / 100;
      const endedIn = Math.round(((e.event.end.toMillis() - Date.now()) / 60000) * 100) / 100;
      return {...e, startsIn, endedIn};
    }).sort((a, b) => {
      if (a.startsIn > b.startsIn) {
        return 1;
      } else if (a.startsIn < b.startsIn) {
        return -1;
      } else {
        return 0;
      }
    });;
  }
  
  checkTimes(events: IEnhancedEvent[], beginCb: (room: IRoom) => void, endCB: (room: IRoom) => void): void {
    const floorRoom: IRoom = {
      id: '123',
      title: 'Flur',
      comfortTemp: 21,
      emptyTemp: 16,
      createdFrom: '',
      createdFromId: '',
      eventColor: '',
      fritzId: ''
    }

    events.sort((a, b) => {
      if (a.event.start > b.event.start) {
        return 1;
      } else if (a.event.start < b.event.start) {
        return -1;
      } else {
        return 0;
      }
    })
    .forEach(e => {
      const roomTempTime = e.room && e.room.tempTime ? e.room.tempTime : Number(process.env.FALLBACK_TEMP_THRESHOLD);
      if (e.room && e.startsIn < roomTempTime && e.startsIn > 0 && !this.heatingUpRooms.has(e.room.id)) {
        this.heatingUpRooms.set(e.room.id, e.room);
        this.coolRooms.delete(e.room.id);
        beginCb(e.room);

      } else if (e.room &&  e.endedIn < 0 && !this.coolRooms.has(e.room.id)) {
        this.heatingUpRooms.delete(e.room.id);
        this.coolRooms.set(e.room.id, e.room);
        endCB(e.room);
      }
    });

    if (this.heatingUpRooms.size > 0 && !this.heatingUpRooms.has(floorRoom.id)) {
      this.heatingUpRooms.set(floorRoom.id, floorRoom);
      this.coolRooms.delete(floorRoom.id);
      beginCb(floorRoom);
    } else if (this.heatingUpRooms.size === 0 && !this.coolRooms.has(floorRoom.id)) {
      this.heatingUpRooms.delete(floorRoom.id);
      this.coolRooms.set(floorRoom.id, floorRoom);
      endCB(floorRoom);
    }
  }
}