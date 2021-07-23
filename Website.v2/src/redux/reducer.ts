import { IState } from '../interfaces/state.interface';
import { ADD_EVENT, LOAD_EVENTS } from './actions/event.actions';
import { USER_LOGIN } from './actions/user.actions';
import { CLEAR_STORE, INITIAL_STATE_DEFAULT } from './store';

export const reducer = (state = INITIAL_STATE_DEFAULT, action: any): IState => {
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
    case CLEAR_STORE:
      state = action.state;
      return state;
    default:
      return state;
  }
};
