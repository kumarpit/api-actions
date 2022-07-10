import { RSAA, RSAAObject } from './types';

export const createAction = (obj: RSAAObject) => {
  return { [RSAA]: obj };
};
