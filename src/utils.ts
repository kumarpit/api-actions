import { defaultRSAA, PlainObject, RSAA, RSAAObject } from './types';


export const createAction = (obj: RSAAObject) => {
  return { [RSAA]: {...defaultRSAA, ...obj} };
};

export const getTypes = (types: string[]) => {
  let [ request, success, failure ] = types;
  
  let requestType: PlainObject, 
      successType: PlainObject, 
      failureType: PlainObject;

  requestType = { type: request }
  successType = { type: success }
  failureType = { type: failure }

  return [ requestType, successType, failureType ];
}

export const isValidRSAA = (obj: object): obj is RSAAObject => {
  let o = obj as RSAAObject;
  return !(o.method == undefined || o.path == undefined || o.types == undefined)
}