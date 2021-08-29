import { IEnhancedEvent, IEvent } from '../interfaces/event.interface';
import { IRoom } from '../interfaces/room.interface';

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
  
  static checkTimes(events: IEnhancedEvent[], beginCb: (event: IEnhancedEvent) => void, endCB: (event: IEnhancedEvent) => void): void {
    events.forEach(e => {
      const roomTempTime = e.room && e.room.tempTime ? e.room.tempTime : Number(process.env.FALLBACK_TEMP_THRESHOLD);
      if (e.startsIn < roomTempTime && e.startsIn > 0) {
        beginCb(e);
      } else if (e.endedIn > -roomTempTime && e.endedIn < 0) {
        endCB(e);
      }
    });
  }
}