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
      background: event.background
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
      background: data.background
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

  static async createEvent(event: IEvent, seriesNr = 0): Promise<void> {
    if (seriesNr === 0) {
      const valid = EventService.checkValidity(event);
      if (valid) {
        EventService.saveEvent(event);
      } else {
        throw new Error('Event is during a background event or an event has already been created in the same room and time');
      }
    } else if (seriesNr > 0) {
      const seriesId = nanoid();
      let nextEvent: IEvent = {...event, seriesNr, seriesId};
      for (let i=seriesNr-1; i >= 0; i--) {
        const valid = EventService.checkValidity(nextEvent);
        if (valid) {
          EventService.saveEvent(nextEvent);
        }
        nextEvent = EventService.eventNextWeek(nextEvent, i, seriesId);
      }
    }
  }

  static async updateEvent(event: IEvent): Promise<void> {
    const valid = EventService.checkValidity(event);
    if(valid) {
      const eventRef = doc(firestore, 'events/', event.id).withConverter(eventConverter);
      await updateDoc(eventRef, event);
      store.dispatch(updateEvent(event));
    } else {
      throw new Error('Event is during a background event or an event has already been created in the same room and time');
    }
  }
  
  static async deleteEvent(eventId: IEvent['id'], allSeries = false): Promise<void> {
    if (!allSeries) {
      EventService.removeEvent(eventId);
    } else {
      const firstEvent = store.getState().events.find(event => event.id === eventId);
      if (firstEvent) {
        store.getState().events.forEach(event => {
          if (firstEvent.seriesId === event.seriesId && firstEvent.start.toDate() < event.start.toDate()) {
            EventService.removeEvent(event.id);
          }
        });
      }
      EventService.removeEvent(eventId);
    }
  }
  
  static async loadEvents(): Promise<void> {
    const eventsRef = collection(firestore, 'events').withConverter(eventConverter);
    const snapshot = await getDocs(eventsRef);
    const events = await EventService.getDataFromSnapshot(snapshot);
    store.dispatch(setEvents(events as IEvent[]));
  }

  static async createBackgroundEvent(title: string, start: Date, end: Date, user: IUser): Promise<void> {
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
      background: true
    } as IEvent);
  }

  static checkValidity(event: IEvent): boolean {
    let validity = true;
    const backgroundEvents = store.getState().events.filter(e => e.background);
    const sameRoomEvents = store.getState().events.filter(e => e.roomId === event.roomId);

    backgroundEvents.forEach(backEvent => {
      if (event.start.toDate() >= backEvent.start.toDate() && event.start.toDate() <= backEvent.end.toDate() ||
      event.end.toDate() >= backEvent.start.toDate() && event.end.toDate() <= backEvent.end.toDate()) {
        validity = false;
      }
    });

    // TODO auslagern!
    sameRoomEvents.forEach(roomEvent => {
      if (event.start.toDate() >= roomEvent.start.toDate() && event.start.toDate() <= roomEvent.end.toDate() ||
      event.end.toDate() >= roomEvent.start.toDate() && event.end.toDate() <= roomEvent.end.toDate()) {
        validity = false;
      }
    });
    return validity;
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
      start: Timestamp.fromDate(new Date(event.start.toDate().getTime() + 7 * 24 * 60 * 60 * 1000)),
      end: Timestamp.fromDate(new Date(event.end.toDate().getTime() + 7 * 24 * 60 * 60 * 1000)),
      seriesId,
      seriesNr
    }
    return newEvent;
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

}