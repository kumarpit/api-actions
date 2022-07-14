import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { FSAObject, PlainObject, RSAA, RSAAObject } from './types';
import { AxiosInstance, AxiosResponse } from 'axios';
import network from './network';
import { normalizeTypeDescriptors, isNetworkError, isValidRSAA, actionWith } from './utils';
import { InternalError, NetworkError, RequestError } from './errors';

const middleware = (axios: AxiosInstance): Middleware => {
  return (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
    if (!action[RSAA]) return next(action);

    return (async () => {
      if (!isValidRSAA(action[RSAA])) {
        console.error(
          'api-actions middleware encountered a malformed RSAA action. Please use the `createApiAction` method to provide RSAA-compliant actions.',
        );
        return;
      }

      const { types, onReqSuccess, onReqFail } = action[RSAA] as RSAAObject;
      const callAPI: RSAAObject = action[RSAA];
      const [requestType, successType, failureType] = normalizeTypeDescriptors(types);

      next(requestType);

      let body: PlainObject = {};
      if (typeof callAPI.body === 'function') {
        try {
          body = { body: await callAPI.body(store.getState) };
        } catch (err) {
          return next({
            ...failureType,
            payload: new InternalError('`[RSAA].body` function error', err),
            error: true,
          });
        }
      }

      let res: AxiosResponse;
      try {
        res = await network(axios, { ...callAPI, ...body });
      } catch (err: any) {
        try {
          if (onReqFail) await onReqFail(store, err, axios);
        } catch (err: any) {
          return next({
            ...failureType,
            payload: new InternalError('`onReqFail` function error', err),
            error: true,
          });
        }

        if (isNetworkError(err)) {
          return next({
            ...failureType,
            payload: new NetworkError(err.message, err),
            error: true,
          });
        } else {
          return next({
            ...failureType,
            payload: new RequestError(err.message, err),
            error: true,
          });
        }
      }

      if (res) {
        try {
          if (onReqSuccess) await onReqSuccess(store, res, axios);
        } catch (err) {
          return next({
            ...failureType,
            payload: new InternalError('`onReqSuccess` function error', err),
            error: true,
          });
        }

        const reqAction: FSAObject = await actionWith(successType, store.getState, res);

        if (reqAction.error) return next({ ...reqAction, ...failureType });
        else return next(reqAction);
      } else {
        return next({
          ...failureType,
          payload: new Error('Got NULL from server'),
          error: true,
        });
      }
    })();
  };
};

export default middleware;
