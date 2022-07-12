<div id="top"></div>
<div align="center">
  <h3 align="center">Reax</h3>

  <p align="center">
    Redux middleware to simplify requests to RESTful APIs using the axios HTTP client
    <br />
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Report Bug</a>
    ·
    <a href="https://github.com/othneildrew/Best-README-Template/issues">Request Feature</a>
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
This package aims to provide a simple interface to dispatch async actions based on API responses using axios. This solution is based on `redux-api-middleware` and the real world problem section from the redux documentation.

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
  body: PlainObject | ((getState: any) => PlainObject);
  types: TypeArray;
  onReqSuccess?: (getState: any, res: AxiosResponse, axios: AxiosInstance) => void;
  onReqFail?: (getState: any, err: AxiosError, axios: AxiosInstance) => void;
  config?: AxiosRequestConfig;
}
```
Let's dissect this. <br>
`Path`: This field is self-explanatory, this is where you pass the URL for your request. Note: this field may also represent just an endpoint if you have set a `baseURL`  for the axios instance passed to `reax`. <br>
`Method`: One of the methods supported by axios.<br>
`Body`: This may be a JSON object or a function that takes in the current state of your redux store as an argument and returns a JSON object.<br>
`Types`: The `TypeArray` is defined as the following:
```javascript
[string, string | RequestDescriptor, string]
```
It is an array of three elements, where the first string is the `type` of the action to be dispatched before the request is made - this may be used to handle loading. The second element describes the action to be dispatched if the API returns a response with status code of type `2xx`. If it just a `string`, the dispatched action will be the following:
```javascript
{ 
  type: [TYPE],
  payload: res.data // res is the AxiosResponse recieved
}
```
However, there may be situations in which you wish to customize the payload of the above action - let's say you want the dispatch the raw response object. This can be done by passing a `RequestDescriptor` instead of a string. A `RequestDescriptor` is an object of the following shape:
```javascript
{
  type: string;
  payload: (getState: any, res: AxiosResponse) => PlainObject;
}
```
Hence, to dispatch the raw response on success, you would use the following array:
```javascript
['REQUEST_TYPE', { type: 'SUCCESS_TYPE', payload: (_, res) => res }, 'FAIL_TYPE']
```
`onReqSuccess`: This is a function that runs to completion upon recieving a successful response and before dispatching the success action. It takes the current state of the redux store, the response object and the axios instance as arguments. One example usage of this function could be to set new default headers to the axios instance based on the response. This would be acheived by the following function:
```javascript
...
onReqSuccess: (_, res, axios) => axios.defaults.headers.common['authorization'] = `BEARER ${res.data.new_access_token}`
...
```
`onReqFail`: Similar to the previous function, this runs to completion upon recieving an `AxiosError` (either an API error or network error) and before dispatching the error action. <br>
`config`: One benefit of passing a `axios` instance to `reax` is that this allows to set default `AxiosRequestConfig` options for all your requests. However, some requests may need to override these defaults. To do this, you could pass in a custom config object which would be applied when making the request.


