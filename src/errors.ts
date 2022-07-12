class InternalError extends Error {
  __error: any;
  constructor(message: string, err: any) {
    super(message);
    this.name = 'InternalError';
    this.__error = err;
  }
}

class NetworkError extends Error {
  __error: any;
  constructor(message: string, err: any) {
    super(message);
    this.name = 'NetWorkError';
    this.__error = err;
  }
}

class RequestError extends Error {
  __error: any;
  constructor(message: string, err: any) {
    super(message);
    this.name = 'RequestError';
    this.__error = err;
  }
}

export { InternalError, NetworkError, RequestError };
