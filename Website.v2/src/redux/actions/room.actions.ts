import { nanoid } from 'nanoid';
import { IRoom } from '../../interfaces/room.interface';

export const LOAD_ROOMS = 'LOAD_ROOMS';
export const ADD_ROOM = 'ADD_ROOM';
export const DELETE_ROOM = 'DELETE_ROOM';
export const EDIT_ROOM = 'EDIT_ROOM';
 
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

export function updateRoom(room: IRoom): {id: string, type: string, room: IRoom} {
  return {
    id: nanoid(),
    type: EDIT_ROOM,
    room
  }
}

export function deleteRoom(roomId: string): {id: string, type: string, roomId: string} {
  return {
    id: nanoid(),
    type: DELETE_ROOM,
    roomId
  }
}