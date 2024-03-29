<div id="top"></div>
<div align="center">
  <h1 align="center">api-actions</h1>

  <p align="center">
    Redux middleware to simplify async actions when communicating with an API, uses the axios HTTP client
    <br />
    <a href="https://github.com/kumarpit/api-actions/issues/new">Report Bug</a>
    ·
    <a href="https://github.com/kumarpit/api-actions/issues/new">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about">About</a>
    </li>
    <li>
      <a href="#installation">Installation</a>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#error-handling">Error Handling</a></li>
    <li><a href="#testing">Testing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

## About
This package provides a simple interface to dispatch async [FSA-compliant](https://github.com/redux-utilities/flux-standard-action) actions based on API responses.

## Installation
```
npm i api-actions
```
In the file where you initialize your redux store, import the `api-actions` middleware, pass it your axios instance, and include it as middleware.
```javascript
import APIActions from 'api-actions';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import axios from 'axios'

const axiosInstance = axios.create({...});

export default configureStore({
  reducer: combineReducers({...}),
  middleware: (gdm) => gdm().concat(APIActions(axiosInstance)),
})
```

## Usage
The `api-actions` middleware takes an `axios` instance upon initalization and intercepts a `RSAA` (Redux Standard API-Calling Action). These are actions identified by the presence of an `[RSAA]` key, where `RSAA` is a `String` constant defined by the `api-actions` middleware. To create a `RSAA` action compatible with the `api-actions` middleware, you must use the `createAPIAction` method, which takes an object describing your API request as a parameter. Here is an example:
```javascript
import { createAPIAction } from 'api-actions';
...
dispatch(createAPIAction({
  path: 'http://example.com/create_action',
  method: 'GET',
  types: ['REQUEST', 'SUCCESS', 'FAIL']
})
```
The `createAPIAction` parameter object is typed as the following:
```javascript
{
  path: string;
  method: HTTPMethod;
  body?: PlainObject | ((getState: () => any) => PlainObject);
  types: TypeArray;
  onReqSuccess?: (getState: () => any, res: AxiosResponse, axios: AxiosInstance) => void;
  onReqFail?: (getState: () => any, err: AxiosError, axios: AxiosInstance) => void;
  config?: AxiosRequestConfig;
}
```
Let's dissect this. 
<br>
- `Path`: This field is self-explanatory - this is where you pass the URL for your request. Note: this field may also represent just an endpoint if you have set a `baseURL`  for the axios instance passed to `api-actions`. <br>
- `Method`: One of the HTTP methods.<br>
- `Body`: This may be a JSON object or a function that takes the current state of your redux store as an argument and returns a JSON object.<br>
- `Types`: The `TypeArray` is defined as the following:
```javascript
[string, string | RequestDescriptor, string]
```
It is an array of three elements, where the first string is the `type` of the action to be dispatched before the request is made - this may be used to handle loading. The second element describes the action to be dispatched if the API returns a response with a status code in the `2xx` range. The last element specifies the `type` of the action dispatched on failure (AxiosError, NetworkError or InternalError - more about error handling in a bit). <br>
If the second element is just a `string` ([TYPE] of action dispatched on success), the dispatched action will default to the following:
```javascript
{ 
  type: [TYPE],
  payload: res.data // res is the AxiosResponse recieved
}
```
However, there may be situations in which you may want to customize the payload of the above action - let's say you want to dispatch `res.statusCode` instead. This can be done by passing a `RequestDescriptor` instead of a `string`. A `RequestDescriptor` is an object of the following shape:
```javascript
{
  type: string;
  payload: (getState: () => any, res: AxiosResponse) => PlainObject;
}
```
Hence, to dispatch `res.statusCode` as the payload, you would use the following array to define `types`:
```javascript
['REQUEST_TYPE', 
  { 
    type: 'SUCCESS_TYPE', 
    payload: (_, res) => res.statusCode 
   }, 
 'FAIL_TYPE']
```
This `types` definition would dispatch the following before the request is made: 
```javascript
{ type: 'REQUEST_TYPE' }
``` 
On recieving a successful response, the dispatched action will be of the following form:
```javascript
{ 
  type: 'SUCCESS_TYPE', 
  payload: '2xx' // res.statusCode
}
``` 
Finally, the action dispatched on error will be the following (more details about error handling here):
```javascript
{
  type: 'FAIL_TYPE', 
  payload: [ERROR OBJECT], 
  error: true 
}
``` 
- `onReqSuccess`: This is a function that runs to completion upon recieving a successful response and _before_ dispatching the success action. It takes the current state of the redux store, the response object and the axios instance as arguments. One example usage of this function could be to set new default headers to the axios instance based on the response. This would be acheived by the following function:
```javascript
...
onReqSuccess: (_, res, axios) => axios.defaults.headers.common['Authorization'] = `BEARER ${res.data.new_access_token}`
...
```
- `onReqFail`: Similar to the previous function, this runs to completion upon recieving an `AxiosError` (either an API error or network error) and _before_ dispatching the error action. <br>
- `config`: One benefit of passing a `axios` instance to `api-actions` is that this allows to set default `AxiosRequestConfig` options to ba applied to all your requests. However, some requests may need to override these defaults. To do this, you could pass in a custom config object.

## Error Handling
In accordance with [FSA](https://github.com/redux-utilities/flux-standard-action), in the case of an error, an action of the following form is returned:
```javascript
{ 
  type: [FAIL_TYPE],
  payload: [ERROR OBJECT],
  error: true
}
```
There are three types of error classes that `api-actions` may return - `InternalError`, `NetworkError`, `RequestError`. `InternalError` is thrown when a user-defined function fails (such as the function passed in the request descriptor), `NetworkError` is thrown when the API is unreachable, and `RequestError` is thrown when the API returns a response with `statusCode` in the `4xx/5xx` range. Each of these error classes extend the `CustomError` class, which defined as the following:
```javascript
class CustomError extends Error {
  __error: any;
  constructor(name: string, message: string, err: any) {
    super(message);
    this.name = name;
    this.__error = err;
  }
}
```
The `__error` property wraps the original error thrown. For example, when an API returns a response with statusCode 400 (i.e Bad Request), the following action is dispatched:
```javascript
{
  type: [FAIL_TYPE],
  payload: {
    name: 'RequestError',
    message: 'Request failed with error code 400',
    __error: [AxiosError object]
  },
  error: true
}
```

## Testing
This package is unit tested using the `mocha` and `chai` libraries. Utilizing `axios-mock-adapter` and `redux-mock-store`, most test code follows this format:
```javascript
// This snippet tests whether a FAIL_ACTION_TYPE is dispatched on receiving a 404 error from the API
it('should dispatch FAIL_ACTION_TYPE on RequestError', async () => {
    // define mock endpoint
    mockAxiosClient.onGet('/test').reply(404);
  
    // array of expected actions to be dispatched by api-actions
    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'FAIL_ACTION_TYPE',
        payload: new RequestError('RequestError: Request failed with status code 404', {}),
        error: true,
      },
    ];
    
    // dispatch APIAction to mock store
    await store.dispatch({
      ...createAPIAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
 });
```
## License
MIT

## Acknowledgements
This package was inspired by the following sources:
- [real-world](https://github.com/reduxjs/redux/blob/master/examples/real-world/src/middleware/api.js) example from Redux <br>
- [redux-api-middleware](https://github.com/agraboso/redux-api-middleware)
