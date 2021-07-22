import { addDoc, collection, deleteDoc, doc, DocumentData, DocumentReference, getDocs, QueryDocumentSnapshot, QuerySnapshot } from 'firebase/firestore';
import { firestore } from '../client-packages/firebase';
import { IEvent } from '../interfaces/event.interface';


export class EventService {

  static createEvent(event: IEvent): Promise<DocumentReference> {
    const eventsColl = collection(firestore, 'events');
    return addDoc(eventsColl, event);
  }
  
  static deleteEvent(eventId: IEvent['id']): Promise<void> {
    const eventRef = doc(firestore, 'events/' + eventId);
    return deleteDoc(eventRef)
  }
  
  static async getEvents(): Promise<DocumentData[]> {
    const eventsRef = collection(firestore, 'events');
    const snapshot = await getDocs(eventsRef);
    return EventService.getDataFromSnapshot(snapshot);
  }

  private static getDataFromSnapshot(snapshot: QuerySnapshot<DocumentData>): DocumentData[] {
    return snapshot.docs.map(value => {
      return { ...value.data(), id: value.id };
    });
  }

}
