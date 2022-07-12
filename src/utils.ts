import { AxiosError } from 'axios';
import { defaultRSAA, PlainObject, RSAA, RSAAObject, RSAAInputObject } from './types';

export const createAction = (obj: RSAAInputObject) => {
  console.log('ACTION CREATED' + { ...defaultRSAA, ...obj });
  return { [RSAA]: { ...defaultRSAA, ...obj } };
};

export const getTypes = (types: string[]) => {
  let [request, success, failure] = types;

  let requestType: PlainObject, successType: PlainObject, failureType: PlainObject;

  requestType = { type: request };
  successType = { type: success };
  failureType = { type: failure };

  return [requestType, successType, failureType];
};

export const isValidRSAA = (obj: object): obj is RSAAObject => {
  let o = obj as RSAAObject;
  return !(o.method == undefined || o.path == undefined || o.types == undefined);
};

export const isNetworkError = (err: AxiosError) => {
  return !err.response;
};
