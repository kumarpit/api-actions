import { AnyAction, Middleware } from 'redux';
import { RSAA, RSAAObject, Nullable } from './types';
import { AxiosInstance, AxiosResponse } from 'axios';
import network from './network';
import { getTypes, isValidRSAA } from './utils';
import { InternalError, RequestError } from './errors';


// set interceptor with access to redux store
// axios.request.use - success, fail
// axios.response.use - success, fail
const middleware = (axios: AxiosInstance): Middleware => {
    // set axios interceptors here
    return (store: any) => (next: any) => async (action: AnyAction) => {
        if (!action[RSAA]) return next(action);

        if (!isValidRSAA(action[RSAA])) {
            console.error('Reax middleware encountered a malformed RSAA object. Please use the `createAction` method to provide RSAA objects.')
            return;
        }

        const { 
            types,
            onSuccess,
            onFail 
        } = action[RSAA] as RSAAObject;
        const callAPI: RSAAObject = action[RSAA];
        const [requestType, successType, failureType] = getTypes(types);

        next(requestType);

        let res: AxiosResponse;
        try {
            res = await network(axios, callAPI);
        } catch (err: any) {
            return next({
                ...failureType,
                payload: new RequestError(err.message),
                error: true
            })
        }
        
        if (res) {
            if (onSuccess) {
                try {
                    await onSuccess(store, res);
                } catch (err) {
                    return next({
                        ...failureType,
                        payload: new InternalError('`onSuccess` function error'),
                        error: true
                    })
                }
            }
            
            return next({
                ...successType,
                payload: res.data
            })
        } else {
            return next({
                ...failureType,
                payload: new InternalError('Got NULL from server'),
                error: true
            })
        }
    }
};

export default middleware;