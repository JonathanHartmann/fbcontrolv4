import { nanoid } from 'nanoid';
import { IRoom } from '../../interfaces/room.interface';

export const LOAD_ROOMS = 'LOAD_ROOMS';
export const ADD_ROOM = 'ADD_ROOM';
 
export function setRooms(rooms: IRoom[]): {id: string, type: string, rooms: IRoom[]} {
  return {
    id: nanoid(),
    type: LOAD_ROOMS,
    rooms
  }
}

export function addRoom(room: IRoom): {id: string, type: string, room: IRoom} {
  return {
    id: nanoid(),
    type: ADD_ROOM,
    room
  }
}