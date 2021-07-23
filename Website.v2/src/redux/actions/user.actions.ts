import { nanoid } from 'nanoid';
import { IUser } from '../../interfaces/user.interface';

export const USER_LOGIN = 'USER_LOGIN';
 
export function userLogin(user: IUser): {id: string, type: string, user: IUser} {
  return {
    id: nanoid(),
    type: USER_LOGIN,
    user: user
  }
}