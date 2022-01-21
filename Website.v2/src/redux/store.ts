import { reducer } from './reducer';
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { IState } from '../interfaces/state.interface';


export const INITIAL_STATE: IState = {
  loggedIn: false,
  user: undefined,
  events: [],
  rooms: [],
  users: []
};

export const store = createStore(
  reducer,
  composeWithDevTools()
)