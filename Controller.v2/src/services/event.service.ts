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
    });
  }
  
  checkTimes(events: IEnhancedEvent[], beginCb: (room: IRoom, event: IEvent | undefined) => void, endCb: (room: IRoom, event: IEvent | undefined) => void): void {
    const fritzRoomId = process.env.ROOM_FRIZTZ_ID;
    const fritzRoomName = process.env.ROOM_NAME;
    const floorRoom: IRoom = {
      id: '123',
      title: fritzRoomName? fritzRoomName : '',
      comfortTemp: 21,
      emptyTemp: 16,
      createdFrom: '',
      createdFromId: '',
      eventColor: '',
      fritzId: fritzRoomId? fritzRoomId : ''
    }

    const actions: {type: 'heat' | 'cool', event: IEnhancedEvent}[] = [];

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
      if (e.room && e.startsIn < roomTempTime && e.startsIn > 0) {
        actions.push({type: 'heat', event: e});
      } else if (e.room &&  e.endedIn < 0 && e.endedIn > -5) {
        actions.push({type: 'cool', event: e});
      }
    });

    const actionPerRoom: string[] = [];
    actions.reverse().forEach(action => {
      if (action.event.room && !actionPerRoom.includes(action.event.room.id)) {
        actionPerRoom.push(action.event.room.id);

        if (action.type === 'heat' && !this.heatingUpRooms.has(action.event.room.id)) {
          this.heatingUpRooms.set(action.event.room.id, action.event.room);
          this.coolRooms.delete(action.event.room.id);
          beginCb(action.event.room, action.event.event);

        } else if (action.type === 'cool' && !this.coolRooms.has(action.event.room.id)) {
          this.heatingUpRooms.delete(action.event.room.id);
          this.coolRooms.set(action.event.room.id, action.event.room);
          endCb(action.event.room, action.event.event);
        }
      }
    });

    const shouldFloorBeHeated = !this.heatingUpRooms.has(floorRoom.id) && this.heatingUpRooms.size > 0;
    const shouldFloorBeCooled = this.heatingUpRooms.has(floorRoom.id) && !this.coolRooms.has(floorRoom.id) && this.heatingUpRooms.size === 1;

    if (shouldFloorBeHeated && floorRoom.fritzId !== '') {
      this.heatingUpRooms.set(floorRoom.id, floorRoom);
      this.coolRooms.delete(floorRoom.id);
      beginCb(floorRoom, undefined);
    } else if (shouldFloorBeCooled) {
      this.heatingUpRooms.delete(floorRoom.id);
      this.coolRooms.set(floorRoom.id, floorRoom);
      endCb(floorRoom, undefined);
    }
  }
}