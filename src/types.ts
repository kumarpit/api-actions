import { AxiosRequestConfig } from "axios";

export type Nullable<T> = T | null;
export type PlainObject = { [name: string]: any }

export const RSAA = '@@reax/RSAA';

export interface RSAAObject {
  path: string;
  method: HTTPMethod;
  body?: PlainObject;
  onSuccess?: ({ getState, dispatch }: any, res: any) => void;
  onFail?: ({ getState, dispatch }: any, err: any) => void;
  config?: AxiosRequestConfig,
  types: string[];
}

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export const defaultRSAA: Partial<RSAAObject> = {
  body: {}
}


/**
 * FSA object:
 * {
 *  type -- must have
 *  payload
 *  error -- if true, paylaod MUST be an error object
 *  meta
 * }
 */