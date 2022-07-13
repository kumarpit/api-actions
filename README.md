<div id="top"></div>
<div align="center">
  <h1 align="center">Reax</h1>

  <p align="center">
    Redux middleware to simplify requests to RESTful APIs using the axios HTTP client
    <br />
    <a href="https://github.com/kumarpit/reax/issues/new">Report Bug</a>
    ·
    <a href="https://github.com/kumarpit/reax/issues/new">Request Feature</a>
  </p>
</div>



<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgments">Acknowledgments</a></li>
  </ol>
</details>

## About
This package aims to provide a simple interface to dispatch async actions based on API responses. It is based on the `redux-api-middleware` and the real world problem section from the redux documentation.

## Installation
```
npm i -S reax
```
In the file where you initialize your redux store, import the reax middleware, pass it your axios instance, and include it as middleware.
```javascript
import reaxMiddleware from 'reax';
import {configureStore} from '@reduxjs/toolkit';
import {combineReducers} from 'redux';
import axios from 'axios'

const axiosInstance = axios.create({...});

export default configureStore({
  reducer: combineReducers({...}),
  middleware: (gdm) => gdm().concat(reaxMiddleware(axiosInstance)),
})
```

## Introduction
The `reax` middleware takes an `axios` instance upon initalization and intercepts a `RSAA` (Redux Standard API-Calling Action). These are actions identified by the presence of an `[RSAA]` key, where `RSAA` is a `String` constant defined by the `reax` middleware. To create a `RSAA` action compatible with the `reax` middleware, you must use the `createAction` method, which takes an object describing your API request as a parameter. Here is an example:
```javascript
import { createAction } from 'reax';
...
dispatch(createAction({
  path: 'http://example.com/create_action',
  method: 'GET',
  types: ['REQUEST', 'SUCCESS', 'FAIL']
})
```
The `createAction` parameter object is typed as the following:
```javascript
{
  path: string;
  method: HTTPMethod;
  body?: PlainObject | ((getState: any) => PlainObject);
  types: TypeArray;
  onReqSuccess?: (getState: any, res: AxiosResponse, axios: AxiosInstance) => void;
  onReqFail?: (getState: any, err: AxiosError, axios: AxiosInstance) => void;
  config?: AxiosRequestConfig;
}
```
Let's dissect this. 
<br>
- `Path`: This field is self-explanatory - this is where you pass the URL for your request. Note: this field may also represent just an endpoint if you have set a `baseURL`  for the axios instance passed to `reax`. <br>
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
  payload: (getState: any, res: AxiosResponse) => PlainObject;
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
- `config`: One benefit of passing a `axios` instance to `reax` is that this allows to set default `AxiosRequestConfig` options to ba applied to all your requests. However, some requests may need to override these defaults. To do this, you could pass in a custom config object.
