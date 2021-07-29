import { addDoc, collection, deleteDoc, doc, DocumentData, getDocs, QuerySnapshot } from 'firebase/firestore';
import { firestore } from '../client-packages/firebase';
import { IEvent } from '../interfaces/event.interface';
import { addEvent, setEvents } from '../redux/actions/event.actions';
import { store } from '../redux/store';


export class EventService {

  static async createEvent(event: IEvent): Promise<void> {
    const eventsColl = collection(firestore, 'events');
    const newEvent = await addDoc(eventsColl, event);
    store.dispatch(addEvent({ ...event, id: newEvent.id}));
  }
  
  static async deleteEvent(eventId: IEvent['id']): Promise<void> {
    const eventRef = doc(firestore, 'events/' + eventId);
    await deleteDoc(eventRef);
    store.dispatch(this.deleteEvent(eventId));
  }
  
  static async loadEvents(): Promise<void> {
    const eventsRef = collection(firestore, 'events');
    const snapshot = await getDocs(eventsRef);
    const events = EventService.getDataFromSnapshot(snapshot);
    store.dispatch(setEvents(events as IEvent[]));
  }

  private static getDataFromSnapshot(snapshot: QuerySnapshot<DocumentData>): DocumentData[] {
    return snapshot.docs.map(value => {
      return { ...value.data(), id: value.id };
    });
  }

}
