import { AxiosError, AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';
import { MiddlewareAPI } from 'redux';

export const RSAA = '@@api-actions/RSAA';

export type Nullable<T> = T | null;
export type PlainObject = { [name: string]: any };
export type RequestDescriptor = {
  type: string;
  payload: (getState: () => any, res: AxiosResponse) => PlainObject;
};

export type TypeArray = [string, string | RequestDescriptor, string];

export interface RSAAObject {
  path: string;
  method: HTTPMethod;
  body?: PlainObject | ((getState: () => any) => PlainObject);
  types: TypeArray;
  onReqSuccess?: ({ getState, dispatch }: MiddlewareAPI, res: AxiosResponse, axios: AxiosInstance) => void;
  onReqFail?: ({ getState, dispatch }: MiddlewareAPI, err: AxiosError, axios: AxiosInstance) => void;
  config?: AxiosRequestConfig;
}

export interface RSAAInputObject {
  path: string;
  method?: HTTPMethod;
  body?: PlainObject | ((getState: () => any) => PlainObject);
  types: TypeArray;
  onReqSuccess?: ({ getState, dispatch }: MiddlewareAPI, res: AxiosResponse, axios: AxiosInstance) => void;
  onReqFail?: ({ getState, dispatch }: MiddlewareAPI, err: AxiosError, axios: AxiosInstance) => void;
  config?: AxiosRequestConfig;
}

export type HTTPMethod = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';

export const defaultRSAA: Partial<RSAAObject> = {
  method: 'GET',
  // body: {},
};

export interface FSAObject {
  type: string;
  payload?: PlainObject | string;
  error?: boolean;
  meta?: PlainObject | string;
}
