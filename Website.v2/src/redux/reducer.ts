import { IState } from '../interfaces/state';

export const INITIAL_STATE: IState = {
  loggedIn: false,
  jwtExpires: 0
};

export const reducer = (state = INITIAL_STATE, action: any): IState  => {
  switch (action.type) {
    default:
      return state;
  }
};