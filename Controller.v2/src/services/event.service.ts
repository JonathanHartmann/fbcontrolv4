import { IEnhancedEvent, IEvent } from '../interfaces/event.interface';
import { IRoom } from '../interfaces/room.interface';
import { firestore as firebaseAdmin } from 'firebase-admin';


export class EventService {

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
      const startsIn = Math.round(((this.getUTCDateFromTimestamp(e.event.start).getTime() - (new Date()).getTime()) / 60000) * 100) / 100;
      const endedIn = Math.round(((this.getUTCDateFromTimestamp(e.event.end).getTime() - (new Date()).getTime()) / 60000) * 100) / 100;
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
  
  static checkTimes(events: IEnhancedEvent[], roomsMap: Map<string, IRoom>): { heatUpRooms: {room: IRoom, event: IEvent | undefined}[], coolDownRooms: {room: IRoom, event: IEvent | undefined}[] } {
    const fritzRoomId = process.env.ROOM_FRITZ_ID;
    const floorRoom = Array.from(roomsMap.values()).find(r => r.fritzId === fritzRoomId);

    const actions: {type: 'heat' | 'cool', event: IEnhancedEvent}[] = [];

    const heatUpRooms: {room: IRoom, event: IEvent | undefined}[] = [];
    const coolDownRooms: {room: IRoom, event: IEvent | undefined}[] = [];

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
      if (e.room && e.startsIn < roomTempTime && e.endedIn > 0 && e.room.tempTime !== 0) {
        actions.push({type: 'heat', event: e});
      } else if (e.room && e.endedIn < 0 && e.endedIn > -5 && e.room.tempTime !== 0) {
        actions.push({type: 'cool', event: e});
      }
    });
    
    const actionPerRoom: string[] = [];
    actions.reverse().forEach(async (action) => {
      if (action.event.room && !actionPerRoom.includes(action.event.room.id)) {
        actionPerRoom.push(action.event.room.id);
        
        if (action.type === 'heat' && !roomsMap.get(action.event.room.id)?.heated) {
          roomsMap.set(action.event.room.id, {...action.event.room, heated: true, cooled: false});
          heatUpRooms.push({ room: action.event.room, event: action.event.event });
          
        } else if (action.type === 'cool' && !roomsMap.get(action.event.room.id)?.cooled) {
          roomsMap.set(action.event.room.id, {...action.event.room, heated: false, cooled: true});
          coolDownRooms.push({ room: action.event.room, event: action.event.event });
        }
      }
    });

    if (floorRoom) {
      const heatedRooms = Array.from(roomsMap.values()).filter(r => r.heated);

      const shouldFloorBeHeated = !roomsMap.get(floorRoom.id)?.heated && heatedRooms.length > 0;
      const shouldFloorBeCooled = roomsMap.get(floorRoom.id)?.heated && !roomsMap.get(floorRoom.id)?.cooled && heatedRooms.length === 1;
  
      if (shouldFloorBeHeated && floorRoom.fritzId !== '') {
        roomsMap.set(floorRoom.id, {...floorRoom, heated: true, cooled: false});
        heatUpRooms.push({ room: floorRoom, event: undefined });
        
      } else if (shouldFloorBeCooled) {
        roomsMap.set(floorRoom.id, {...floorRoom, heated: false, cooled: true});
        coolDownRooms.push({ room: floorRoom, event: undefined });
        for (const room of Array.from(roomsMap.values())) {
          coolDownRooms.push({ room, event: undefined });
        }
      }
    }

    return { heatUpRooms, coolDownRooms };
  }

  private static getUTCDateFromTimestamp(timestamp: firebaseAdmin.Timestamp): Date {
    const [year, month, day] = this.getDate(timestamp.toDate()).split('-').map(s => Number(s));
    const [hours, minutes] = this.getTime(timestamp.toDate()).split(':').map(s => Number(s));

    const date = new Date(year, month, day, hours, minutes);
    return date;
  }

  private static getTime(date: Date): string {
    if (date) {
      let hours = date.getUTCHours().toString();
      let min = date.getUTCMinutes().toString();
      if (hours.length === 1) {
        hours = '0' + hours;
      }
      if (min.length === 1) {
        min = '0' + min;
      }
      return `${hours}:${min}`;
    } else {
      return '';
    }
  }

  private static getDate(date: Date, addDays = 0): string {
    if (date) {
      const year = date.getUTCFullYear();
      let month = (date.getUTCMonth()).toString();
      date.setDate(date.getUTCDate() + addDays);
      let day = date.getDate().toString();
  
      if (month.length === 1) {
        month = '0' + month;
      }
      if (day.length === 1) {
        day = '0' + day;
      }
  
      return `${year}-${month}-${day}`;
    } else {
      return '';
    }
  }
}