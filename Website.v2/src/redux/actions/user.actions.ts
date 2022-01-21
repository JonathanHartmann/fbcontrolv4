import { nanoid } from 'nanoid';
import { IUser } from '../../interfaces/user.interface';

export const USER_LOGIN = 'USER_LOGIN';
export const LOAD_USERS = 'LOAD_USERS';
 
export function userLogin(user: IUser): {id: string, type: string, user: IUser} {
  return {
    id: nanoid(),
    type: USER_LOGIN,
    user: user
  }
}
 
export function setUsers(users: IUser[]): {id: string, type: string, users: IUser[]} {
  return {
    id: nanoid(),
    type: LOAD_USERS,
    users
  }
}