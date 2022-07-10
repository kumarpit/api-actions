import { AnyAction, Middleware } from 'redux';
import { RSAA, RSAAObject } from './types';
import { AxiosInstance } from 'axios';
import Network from './network';

const middleware = (axios: AxiosInstance): Middleware => {
  return (store: any) => (next: any) => async (action: AnyAction) => {
    if (!action[RSAA]) return next(action);
    console.log(action[RSAA]);
    const { path, method, body, onSuccess, onFail } = action[RSAA] as RSAAObject;
    const { getState, dispatch } = store;

    let res = {};
    try {
        switch (method) {
            case 'get':
                res = await Network.get(axios, { path: path })
                break;
            case 'post': 
                res = await Network.post(axios, { path: path, body: body })
                break;
            default:
                console.error('INVALID HTTP METHOD');
                break;
        }
        if (onSuccess) await onSuccess(store, res);
        console.log(res);
    } catch (err) {
        await onFail(store, err);
        console.error(err);
        // read about the error class
    }
  }
};

export default middleware;
