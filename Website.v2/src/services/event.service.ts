import { addDoc, collection, deleteDoc, doc, DocumentData, getDoc, getDocs, getDocsFromCache, QueryDocumentSnapshot, QuerySnapshot, SnapshotOptions } from 'firebase/firestore';
import { firestore } from '../client-packages/firebase';
import { IEvent } from '../interfaces/event.interface';
import { addEvent, deleteEvent, setEvents } from '../redux/actions/event.actions';
import { store } from '../redux/store';


const eventConverter = {
  toFirestore(event: IEvent): DocumentData {
    return {
      title: event.title,
      start: event.start,
      end: event.end,
      room: event.room,
      createdFrom: event.createdFrom
    };
  },
  fromFirestore(
    snapshot: QueryDocumentSnapshot,
    options: SnapshotOptions
  ): IEvent {
    const data = snapshot.data(options)!;
    return {
      id: snapshot.id,
      title: data.title,
      start: data.start,
      end: data.end,
      room: data.room,
      createdFrom: data.createdFrom
    };
  }
};


export class EventService {

  static async createEvent(event: IEvent): Promise<void> {
    const eventsColl = collection(firestore, 'events').withConverter(eventConverter);
    const newEvent = await await addDoc(eventsColl, {...event});
    store.dispatch(addEvent({ ...event, id: newEvent.id}));
  }
  
  static async deleteEvent(eventId: IEvent['id']): Promise<void> {
    const eventRef = doc(firestore, 'events/' + eventId);
    await deleteDoc(eventRef);
    store.dispatch(deleteEvent(eventId));
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

}