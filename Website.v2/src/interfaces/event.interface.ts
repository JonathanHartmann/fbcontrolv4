import { Timestamp } from 'firebase/firestore';

export interface IEvent {
  id: string;
  title: string;
  start: Timestamp;
  end: Timestamp;
  room: string;
  roomId: string;
  createdFrom: string;
  createdFromId: string;
}