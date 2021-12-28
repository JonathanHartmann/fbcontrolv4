import { addDoc, collection, deleteDoc, doc, DocumentData, getDocs, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, Timestamp, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { firestore } from '../client-packages/firebase';
import { IEvent } from '../interfaces/event.interface';
import { IUser } from '../interfaces/user.interface';
import { addEvent, deleteEvent, setEvents, updateEvent } from '../redux/actions/event.actions';
import { store } from '../redux/store';


const eventConverter = {
  toFirestore(event: IEvent): DocumentData {
    const returnEvent = {
      title: event.title,
      description: event.description,
      start: event.start,
      end: event.end,
      room: event.room,
      roomId: event.roomId,
      createdFrom: event.createdFrom,
      createdFromId: event.createdFromId,
      createdAt: event.createdAt,
      background: event.background,
      allDay: event.allDay,
      seriesEndless: event.seriesEndless,
      seriesDuringHoliday: event.seriesDuringHoliday
    };
    if (event.seriesId) {
      return {
        ...returnEvent,
        seriesId: event.seriesId,
        seriesNr: event.seriesNr
      }
    }
    return returnEvent;
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): IEvent {
    const data = snapshot.data(options);
    const returnEvent = {
      id: snapshot.id,
      title: data.title,
      description: data.description,
      start: data.start,
      end: data.end,
      room: data.room,
      roomId: data.roomId,
      createdFrom: data.createdFrom,
      createdFromId: data.createdFromId,
      createdAt: data.createdAt,
      background: data.background,
      allDay: data.allDay,
      seriesEndless: data.seriesEndless? data.seriesEndless : false,
      seriesDuringHoliday: data.seriesDuringHoliday
    };
    if (data.seriesId) {
      return {
        ...returnEvent,
        seriesId: data.seriesId,
        seriesNr: data.seriesNr
      }
    }
    return returnEvent;
  }
};


export class EventService {

  static async createEvent(event: IEvent, seriesDate: Date | undefined = undefined): Promise<void> {
    if (!seriesDate && !event.seriesEndless) {
      const validRoom = EventService.checkRoomValidity(event);
      if (validRoom) {
        await EventService.saveEvent(event);
      } else {
        throw new Error('Event is during a background event or an event has already been created in the same room and time');
      }
    } else if ((seriesDate && seriesDate > new Date()) || event.seriesEndless) {
      const seriesId = nanoid();
      const oneYearFromNow = new Date(event.start.toDate());
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
      const seriesNr = event.seriesEndless ? EventService.getNrWeeksUntil(event.start.toDate(), oneYearFromNow) : EventService.getNrWeeksUntil(event.start.toDate(), seriesDate!);
      let nextEvent: IEvent = {...event, seriesNr, seriesId};
      for (let i=seriesNr-1; i >= 0; i--) {
        const validRoom = EventService.checkRoomValidity(event);
        const valid = event.seriesDuringHoliday? true : EventService.checkValidity(nextEvent);
        if (valid && validRoom) {
          EventService.saveEvent(nextEvent);
        }
        nextEvent = EventService.eventNextWeek(nextEvent, i, seriesId);
      }
    }
  }

  static async updateEvent(event: IEvent): Promise<void> {
    const valid = EventService.checkRoomValidity(event);
    if(valid) {
      await EventService.updateSingleEvent(event);
    } else {
      throw new Error('Event is during a background event or an event has already been created in the same room and time');
    }
  }
  
  static async deleteEvent(eventId: IEvent['id'], allSeries = false): Promise<void> {
    if (!allSeries) {
      await EventService.removeEvent(eventId);
    } else {
      const firstEvent = store.getState().events.find(event => event.id === eventId);
      if (firstEvent) {
        store.getState().events.forEach(async event => {
          if (firstEvent.seriesId === event.seriesId && firstEvent.start.toDate() < event.start.toDate()) {
            await EventService.removeEvent(event.id);
          }
        });
      }
      await EventService.removeEvent(eventId);
    }
  }
  
  static async loadEvents(): Promise<void> {
    const eventsRef = collection(firestore, 'events').withConverter(eventConverter);
    const snapshot = await getDocs(eventsRef);
    const events = await EventService.getDataFromSnapshot(snapshot);
    store.dispatch(setEvents(events as IEvent[]));
  }

  static async createBackgroundEvent(title: string, start: Date, end: Date, user: IUser): Promise<void> {
    EventService.deleteBackroungEventsForTimespan(start, end);
    await EventService.createEvent({
      title: title,
      description: 'An diesem Tag können keine Buchungen vorgenommen werden.',
      start: Timestamp.fromDate(start),
      end: Timestamp.fromDate(end),
      room: '',
      roomId: '',
      createdFrom: user.name,
      createdFromId: user.id,
      createdAt: Timestamp.now(),
      background: true,
      seriesEndless: false,
      seriesDuringHoliday: false,
      allDay: true
    } as IEvent);
  }

  static checkValidity(event: IEvent): boolean {
    let validity = true;
    const backgroundEvents = store.getState().events.filter(e => e.background);
    backgroundEvents.forEach(backEvent => {
      if (event.start.toDate() >= backEvent.start.toDate() && event.start.toDate() <= backEvent.end.toDate() ||
      event.end.toDate() >= backEvent.start.toDate() && event.end.toDate() <= backEvent.end.toDate()) {
        validity = false;
      }
    });
    return validity;
  }

  private static checkRoomValidity(event: IEvent): boolean {
    let validity = true;
    const sameRoomEvents = store.getState().events.filter(e => (e.roomId === event.roomId) && (e.id !== event.id));
    sameRoomEvents.forEach(roomEvent => {
      const roomEventEnd = roomEvent.end.toDate();
      roomEventEnd.setMinutes(roomEventEnd.getMinutes() - 1);
      const roomEventStart = roomEvent.start.toDate();
      roomEventStart.setMinutes(roomEventStart.getMinutes() + 1);
      if (event.start.toDate() >= roomEventStart && event.start.toDate() <= roomEventEnd ||
      event.end.toDate() >= roomEventStart && event.end.toDate() <= roomEventEnd) {
        validity = false;
      }
    });
    return validity;
  }

  private static deleteBackroungEventsForTimespan(start: Date, end: Date) {
    const backgroundEvents = store.getState().events.filter(e => e.background);
    backgroundEvents.forEach(async backEvent => {
      if (start >= backEvent.start.toDate() && start <= backEvent.end.toDate() ||
        end >= backEvent.start.toDate() && end >= backEvent.end.toDate()) {
        await EventService.deleteEvent(backEvent.id);
      }
    });
  }

  private static getDataFromSnapshot(snapshot: QuerySnapshot<DocumentData>): DocumentData[] {
    return snapshot.docs.map(value => {
      return {
        ...value.data(),
        id: value.id
      };
    });
  }

  private static eventNextWeek(event: IEvent, seriesNr: number, seriesId: string): IEvent {
    const newEvent: IEvent = {
      ...event,
      start: Timestamp.fromMillis(event.start.seconds * 1000 + 7 * 24 * 60 * 60 * 1000),
      end: Timestamp.fromMillis(event.end.seconds * 1000 + 7 * 24 * 60 * 60 * 1000),
      seriesId,
      seriesNr
    }
    return newEvent;
  }

  private static async updateSingleEvent(event: IEvent): Promise<void> {
    const eventRef = doc(firestore, 'events/', event.id).withConverter(eventConverter);
    await updateDoc(eventRef, event);
    store.dispatch(updateEvent(event));
  }

  private static async saveEvent(event: IEvent): Promise<void> {
    const eventsColl = collection(firestore, 'events').withConverter(eventConverter);
    const newEvent = await addDoc(eventsColl, {...event});
    store.dispatch(addEvent({ ...event, id: newEvent.id}));
  }

  private static async removeEvent(eventId: string): Promise<void> {
    const eventRef = doc(firestore, 'events/' + eventId);
    await deleteDoc(eventRef);
    store.dispatch(deleteEvent(eventId));
  }

  private static getNrWeeksUntil(startDate: Date, endDate: Date) {
    return Math.round((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000)) + 1;
  }

}