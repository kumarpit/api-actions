import { AnyAction, Middleware } from 'redux';
import { PlainObject, RSAA, RSAAObject } from './types';
import { AxiosInstance, AxiosResponse } from 'axios';
import network from './network';
import { getTypes, isNetworkError, isValidRSAA } from './utils';
import { InternalError, NetworkError, RequestError } from './errors';

// set interceptor with access to redux store
// axios.request.use - success, fail
// axios.response.use - success, fail
const middleware = (axios: AxiosInstance): Middleware => {
  // set axios interceptors here
  return (store: any) => (next: any) => async (action: AnyAction) => {
    if (!action[RSAA]) return next(action);

    if (!isValidRSAA(action[RSAA])) {
      console.error(
        'Reax middleware encountered a malformed RSAA object. Please use the `createAction` method to provide RSAA objects.',
      );
      return;
    }

    const { types, onSuccess, onFail } = action[RSAA] as RSAAObject;
    const callAPI: RSAAObject = action[RSAA];
    const [requestType, successType, failureType] = getTypes(types);

    next(requestType);

    let body: PlainObject = {};
    if (typeof callAPI.body == 'function') {
      try {
        body = { body: await callAPI.body(store.getState) };
      } catch (err) {
        return next({
          ...failureType,
          payload: new InternalError('[RSAA].body function error'),
          error: true,
        });
      }
    }

    let res: AxiosResponse;
    try {
      res = await network(axios, { ...callAPI, ...body });
    } catch (err: any) {
      try {
        if (onFail) await onFail(store, err);
      } catch (err: any) {
        return next({
          ...failureType,
          payload: new InternalError('`onFail` function error'),
          error: true,
        });
      }

      if (isNetworkError(err)) {
        return next({
          ...failureType,
          payload: new NetworkError(err.message),
          error: true,
        });
      } else {
        return next({
          ...failureType,
          payload: new RequestError(err.message),
          error: true,
        });
      }
    }

    if (res) {
      try {
        if (onSuccess) await onSuccess(store, res);
      } catch (err) {
        return next({
          ...failureType,
          payload: new InternalError('`onSuccess` function error'),
          error: true,
        });
      }

      return next({
        ...successType,
        payload: res.data,
      });
    } else {
      return next({
        ...failureType,
        payload: new InternalError('Got NULL from server'),
        error: true,
      });
    }
  };
};

export default middleware;
