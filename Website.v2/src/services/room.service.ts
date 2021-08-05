import { addDoc, collection, deleteDoc, doc, DocumentData, getDocs, QuerySnapshot } from 'firebase/firestore';
import { firestore } from '../client-packages/firebase';
import { IRoom } from '../interfaces/room.interface';
import { addRoom, deleteRoom, setRooms } from '../redux/actions/room.actions';
import { store } from '../redux/store';


export class RoomService {

  static async createRoom(room: Partial<IRoom>): Promise<void> {
    const roomsColl = collection(firestore, 'rooms');
    const newEvent = await addDoc(roomsColl, room);
    store.dispatch(addRoom({ ...room, id: newEvent.id} as IRoom));
  }
  
  static async deleteRoom(roomId: IRoom['id']): Promise<void> {
    const roomRef = doc(firestore, 'rooms/' + roomId);
    try {
      await deleteDoc(roomRef);
      store.dispatch(deleteRoom(roomId));
    } catch(e) {
      throw new Error('Error by deleting Room! ' + e);
    }
  }
  
  static async loadRooms(): Promise<void> {
    const roomsRef = collection(firestore, 'rooms');
    const snapshot = await getDocs(roomsRef);
    const rooms = RoomService.getDataFromSnapshot(snapshot);
    store.dispatch(setRooms(rooms as IRoom[]));
  }

  private static getDataFromSnapshot(snapshot: QuerySnapshot<DocumentData>): DocumentData[] {
    return snapshot.docs.map(value => {
      return { ...value.data(), id: value.id };
    });
  }

}
