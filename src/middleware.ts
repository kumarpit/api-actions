/* tslint:disable:no-console */

import { AnyAction, Dispatch, Middleware, MiddlewareAPI } from 'redux';
import { FSAObject, PlainObject, RSAA, RSAAObject } from './types';
import { AxiosInstance, AxiosResponse } from 'axios';
import network from './network';
import { normalizeTypeDescriptors, isNetworkError, isValidRSAA, actionWith } from './utils';
import { InternalError, NetworkError, RequestError } from './errors';

/**
 * This function defines flow of execution upon
 * intercepting a RSAA action
 *
 * @param axios - AxiosIntsance used to make API requests
 * @returns ReduxMiddleware
 */
const middleware = (axios: AxiosInstance): Middleware => {
  return (store: MiddlewareAPI) => (next: Dispatch) => (action: AnyAction) => {
    if (!action[RSAA]) return next(action);

    return (async () => {
      if (!isValidRSAA(action[RSAA])) {
        console.error(
          'api-actions middleware encountered a malformed RSAA action. Please use the `createAPIAction` method to provide RSAA-compliant actions.',
        );
        return;
      }

      const { types, onReqSuccess, onReqFail } = action[RSAA] as RSAAObject;
      const callAPI: RSAAObject = action[RSAA];
      const [requestType, successType, failureType] = normalizeTypeDescriptors(types);

      // dispatch request action
      next(requestType);

      // call body function if defined
      let body: PlainObject | undefined = callAPI.body;
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

      // make request
      let res: AxiosResponse;
      try {
        res = await network(axios, { ...callAPI, ...body });
      } catch (err: any) {
        try {
          // call onReqFail if exists
          if (onReqFail) await onReqFail(store, err, axios);
        } catch (err: any) {
          return next({
            ...failureType,
            payload: new InternalError('`onReqFail` function error', err),
            error: true,
          });
        }

        // dispatch fail action
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

      // call onReqSuccess if defined
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

        // dispatch success action, calls descriptor.payload if defined
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
