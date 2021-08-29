import { Timestamp } from '@google-cloud/firestore';
import { IRoom } from './room.interface';

export interface IEvent {
  id: string;
  title: string;
  description: string;
  start: Timestamp;
  end: Timestamp;
  room: string;
  roomId: string;
  createdFrom: string;
  createdFromId: string;
  createdAt: Timestamp;
  background: boolean;
  allDay: boolean;
  seriesId?: string;
  seriesNr?: number;
}

export interface IEnhancedEvent {
  event: IEvent;
  room: IRoom | undefined;
  startsIn: number;
  endedIn: number;
}