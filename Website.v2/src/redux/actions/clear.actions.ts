import { nanoid } from 'nanoid';
import { IState } from '../../interfaces/state.interface';
import { INITIAL_STATE } from '../store';

export const CLEAR_STORE = 'CLEAR_STORE';

export function clearStore(): {id: string, type: string, state: IState} {
  return {
    type: CLEAR_STORE,
    id: nanoid(),
    state: { ...INITIAL_STATE }
  };
}