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
The reax middleware recieves a `RSAA` (Redux Standard API-Calling Action). These are actions identified by the presence of an `[RSAA]` key, where `RSAA` is a `String` constant defined by the `reax` middleware. To create a `RSAA` action compatible with the `reax` middleware, you must use the `createAction` method, which takes an object describing your API request as a parameter. Here is an example:
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
  path: string;
  method: HTTPMethod;
  body: PlainObject | ((getState: any) => PlainObject);
  types: TypeArray;
  onReqSuccess?: ({ getState, dispatch }: any, res: AxiosResponse, axios: AxiosInstance) => void;
  onReqFail?: ({ getState, dispatch }: any, err: AxiosError, axios: AxiosInstance) => void;
  config?: AxiosRequestConfig;
```





