import { reducer } from './reducer';
import { createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { nanoid } from 'nanoid';
import { IState } from '../interfaces/state.interface';


export const INITIAL_STATE_DEFAULT: IState = {
  loggedIn: false,
  user: undefined,
  events: []
};

export const CLEAR_STORE = 'CLEAR_STORE';

export const clearStore = (): {id: string, type: string, state: IState} => {
  return {
    type: CLEAR_STORE,
    id: nanoid(),
    // muss so gemacht werden, sonst wird der State zum INITIAL_STATE_DEFAULT (Referenz);
    state: Object.assign({}, INITIAL_STATE_DEFAULT)
  };
};


export const store = createStore(
  reducer,
  composeWithDevTools()
)