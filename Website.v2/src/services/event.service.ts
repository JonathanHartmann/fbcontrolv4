import { addDoc, collection, deleteDoc, doc, DocumentData, getDocs, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions, Timestamp, updateDoc } from 'firebase/firestore';
import { nanoid } from 'nanoid';
import { firestore } from '../client-packages/firebase';
import { IEvent } from '../interfaces/event.interface';
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
      createdFromId: event.createdFromId
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
      createdFromId: data.createdFromId
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
      EventService.saveEvent(event)
    } else if (seriesNr > 0) {
      const seriesId = nanoid();
      let nextEvent: IEvent = {...event, seriesNr, seriesId};
      for (let i=seriesNr-1; i >= 0; i--) {
        EventService.saveEvent(nextEvent);
        nextEvent = EventService.eventNextWeek(nextEvent, i, seriesId);
      }
    }
  }

  static async updateEvent(event: IEvent): Promise<void> {
    const eventRef = doc(firestore, 'events/', event.id).withConverter(eventConverter);
    await updateDoc(eventRef, event);
    store.dispatch(updateEvent(event));
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