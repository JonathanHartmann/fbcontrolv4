import { Timestamp } from 'firebase/firestore';

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
  createdAt?: Timestamp;
  background: boolean;
  allDay: boolean;
  seriesId?: string;
  seriesNr?: number;
  seriesEndless?: boolean;
  seriesDuringHoliday: boolean;
}