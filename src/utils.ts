import { AxiosError, AxiosResponse } from 'axios';
import { InternalError } from './errors';
import { defaultRSAA, RSAA, RSAAObject, RSAAInputObject, TypeArray, ResponseDescriptor, FSAObject } from './types';

/**
 * This the function to be used when creating a RSAA action
 *
 * @param obj RSAAInputObject a subset of RSAAObject values
 * @returns a RSAA compatible action with default values injected (method defaults to GET)
 */
export const createAPIAction = (obj: RSAAInputObject) => {
  return { [RSAA]: { ...defaultRSAA, ...obj }, type: RSAA };
};

/**
 * This function takes the types array and converts them to redux compatible actions
 *
 * @param types array of action types to be dispatched on REQUEST, SUCCESS and FAIL
 * @returns array of actions
 */
export const normalizeTypeDescriptors = (types: TypeArray): [FSAObject, ResponseDescriptor, FSAObject] => {
  const [request, success, failure] = types;

  let requestType: FSAObject, successType: ResponseDescriptor, failureType: FSAObject;

  requestType = { type: request };
  failureType = { type: failure };

  if (typeof success === 'string') {
    successType = {
      type: success,
      payload: (_, res) => res.data,
    };
  } else successType = success;

  return [requestType, successType, failureType];
};

/**
 * This function is responsible for calling the descriptor.payload function
 * if it is defined
 *
 * @param descriptor ResponseDescriptor passed by the user
 * @param getState The redux getState function
 * @param res AxiosResponse object
 * @returns FSAObject to be returned on SUCCESS
 */
export const actionWith = async (
  descriptor: ResponseDescriptor,
  getState: any,
  res: AxiosResponse,
): Promise<FSAObject> => {
  const ret: FSAObject = { type: descriptor.type, payload: '' };
  try {
    if (typeof descriptor.payload === 'function') {
      ret.payload = await descriptor.payload(getState, res);
    } else ret.payload = descriptor.payload;
  } catch (err) {
    ret.payload = new InternalError('descriptor.payload function error', err);
    ret.error = true;
  }

  return ret;
};

/**
 * Checks if RSAAObject is well-defined
 *
 * @param obj RSAAObject to be validated
 * @returns true if valid, else false
 */
export const isValidRSAA = (obj: object): obj is RSAAObject => {
  const o = obj as RSAAObject;
  return !(o.method === undefined || o.path === undefined || o.types === undefined);
};

/**
 * Checks if request failed due to network error
 *
 * @param err AxiosError
 * @returns true if network error, else false
 */
export const isNetworkError = (err: AxiosError) => {
  return !err.response;
};
