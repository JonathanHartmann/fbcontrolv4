import { firestore } from '../config/firebase';
import { IEvent } from '../interfaces/event.interface';
import { IRoom } from '../interfaces/room.interface';

export class FirebaseService {
  static async loadEvents(): Promise<IEvent[]> {
    const eventSnap = await firestore.collection('events').get();
    const events = FirebaseService.getDataFromSnapshot(eventSnap);
    return events as IEvent[];
  }

  static async loadRooms(): Promise<IRoom[]> {
    const roomSnap = await firestore.collection('rooms').get();
    const rooms = FirebaseService.getDataFromSnapshot(roomSnap);
    return rooms as IRoom[];
  }

  private static getDataFromSnapshot(snapshot: FirebaseFirestore.QuerySnapshot<FirebaseFirestore.DocumentData>): FirebaseFirestore.DocumentData[] {
    return snapshot.docs.map((value: any) => {
      return {
        ...value.data(),
        id: value.id
      };
    });
  }
}