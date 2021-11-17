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
  seriesDuringHoliday: boolean;
  seriesId?: string;
  seriesNr?: number;
  seriesEndless?: boolean;
  seriesEndDate?: Timestamp;
}