import { IEvent } from './event.interface';
import { IRoom } from './room.interface';
import { IUser } from './user.interface';

export interface IState {
  loggedIn: boolean,
  user: IUser | undefined,
  events: IEvent[],
  rooms: IRoom[]
}
