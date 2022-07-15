/* tslint:disable:max-classes-per-file */
/* tslint:disable:variable-name */

/**
 * Error class that defines shape of all errors
 * thrown on an exception
 *
 * @class CustomError
 * @param name name of the error - string
 * @param message error message - string
 * @param err error object - any
 */
class CustomError extends Error {
  __error: any;
  constructor(name: string, message: string, err: any) {
    super(message);
    this.name = name;
    this.__error = err;
  }
}

/**
 * Thrown when an user-defined function throws an error
 * for eg. An InternalError will be thrown when [RSAA].body function
 * fails
 */
class InternalError extends CustomError {
  constructor(message: string, err: any) {
    super('InternalError', message, err);
  }
}

/**
 * Thrown when the API is unreachable or no response
 * is recieved
 */
class NetworkError extends CustomError {
  constructor(message: string, err: any) {
    super('NetworkError', message, err);
  }
}

/**
 * Thrown when a response with status code 4xx/5xx
 * is received
 */
class RequestError extends CustomError {
  constructor(message: string, err: any) {
    super('RequestError', message, err);
  }
}

export { InternalError, NetworkError, RequestError };
