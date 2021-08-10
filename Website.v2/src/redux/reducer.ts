import { IState } from '../interfaces/state.interface';
import { CLEAR_STORE } from './actions/clear.actions';
import { ADD_EVENT, DELTE_EVENT, LOAD_EVENTS, EDIT_EVENT } from './actions/event.actions';
import { ADD_ROOM, DELETE_ROOM, LOAD_ROOMS } from './actions/room.actions';
import { USER_LOGIN } from './actions/user.actions';
import { INITIAL_STATE } from './store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types, @typescript-eslint/no-explicit-any
export const reducer = (state = { ...INITIAL_STATE }, action: any): IState => {
  switch (action.type) {
    case USER_LOGIN:
      state.user = action.user;
      state.loggedIn = true;
      return state;
    case LOAD_EVENTS:
      state.events = action.events;
      return state;
    case ADD_EVENT:
      state.events = [ ...state.events, action.event];
      return state;
    case EDIT_EVENT:
      state.events = state.events.map(event => event.id === action.event.id? action.event : event);
      return state;
    case DELTE_EVENT:
      state.events = state.events.filter(e => e.id !== action.eventId);
      return state;
    case LOAD_ROOMS:
      state.rooms = action.rooms;
      return state;
    case ADD_ROOM:
      state.rooms = [ ...state.rooms, action.room];
      return state;
    case DELETE_ROOM:
      state.rooms = state.rooms.filter(r => r.id !== action.roomId);
      return state;
    case CLEAR_STORE:
      state = { ...INITIAL_STATE };
      return state;
    default:
      return state;
  }
};
