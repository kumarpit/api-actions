import { AxiosError, AxiosResponse } from 'axios';
import { InternalError } from './errors';
import { defaultRSAA, RSAA, RSAAObject, RSAAInputObject, TypeArray, RequestDescriptor, FSAObject } from './types';

export const createAPIAction = (obj: RSAAInputObject) => {
  return { [RSAA]: { ...defaultRSAA, ...obj }, type: RSAA };
};

export const normalizeTypeDescriptors = (types: TypeArray): [FSAObject, RequestDescriptor, FSAObject] => {
  const [request, success, failure] = types;

  let requestType: FSAObject, successType: RequestDescriptor, failureType: FSAObject;

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

export const actionWith = async (
  descriptor: RequestDescriptor,
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

export const isValidRSAA = (obj: object): obj is RSAAObject => {
  const o = obj as RSAAObject;
  return !(o.method === undefined || o.path === undefined || o.types === undefined);
};

export const isNetworkError = (err: AxiosError) => {
  return !err.response;
};
