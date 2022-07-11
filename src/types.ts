import { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

export type Nullable<T> = T | null;
export type PlainObject = { [name: string]: any };

export const RSAA = '@@reax/RSAA';

export interface RSAAObject {
  path: string;
  method: HTTPMethod;
  body: PlainObject | ((getState: any) => PlainObject);
  onSuccess?: ({ getState, dispatch }: any, res: AxiosResponse) => void;
  onFail?: ({ getState, dispatch }: any, err: AxiosError) => void;
  config?: AxiosRequestConfig;
  types: string[];
}

export interface RSAAInputObject {
  path: string;
  method?: HTTPMethod;
  body?: PlainObject | ((getState: any) => PlainObject);
  onSuccess?: ({ getState, dispatch }: any, res: AxiosResponse) => void;
  onFail?: ({ getState, dispatch }: any, err: AxiosError) => void;
  config?: AxiosRequestConfig;
  types: string[];
}

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export const defaultRSAA: Partial<RSAAObject> = {
  method: 'GET',
  body: {},
};

/**
 * FSA object:
 * {
 *  type -- must have
 *  payload
 *  error -- if true, paylaod MUST be an error object
 *  meta
 * }
 */
