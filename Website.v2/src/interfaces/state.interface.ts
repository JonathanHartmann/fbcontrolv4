import { IEvent } from './event.interface';
import { IUser } from './user.interface';

export interface IState {
  loggedIn: boolean,
  user: IUser | undefined,
  events: IEvent[],
}
