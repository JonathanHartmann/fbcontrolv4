import { User } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export interface IEvent {
  id: string;
  title: string;
  room: string;
  createdFrom: string;
  start: Timestamp;
  end: Timestamp;
}