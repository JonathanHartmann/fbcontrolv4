import { nanoid } from 'nanoid';
import { IEvent } from '../../interfaces/event.interface';

export const LOAD_EVENTS = 'LOAD_EVENTS';
export const ADD_EVENT = 'ADD_EVENT';
export const EDIT_EVENT = 'EDIT_EVENT';
export const DELTE_EVENT = 'DELTE_EVENT';
 
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

export function updateEvent(event: IEvent): {id: string, type: string, event: IEvent} {
  return {
    id: nanoid(),
    type: EDIT_EVENT,
    event
  }
}

export function deleteEvent(eventId: string): {id: string, type: string, eventId: string} {
  return {
    id: nanoid(),
    type: DELTE_EVENT,
    eventId
  }
}