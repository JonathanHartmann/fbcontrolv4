import { nanoid } from 'nanoid';
import { IEvent } from '../../interfaces/event.interface';

export const LOAD_EVENTS = 'LOAD_EVENTS';
export const ADD_EVENT = 'ADD_EVENT';
 
export function setEvents(events: IEvent[]): {id: string, type: string, events: IEvent[]} {
  return {
    id: nanoid(),
    type: LOAD_EVENTS,
    events
  }
}

export function addEvent(event: IEvent): {id: string, type: string, event: IEvent} {
  return {
    id: nanoid(),
    type: ADD_EVENT,
    event
  }
}