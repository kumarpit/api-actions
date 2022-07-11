class InternalError extends Error {
  constructor(message: string) {
    super();
    (this.name = 'InternalError'), (this.message = message);
  }
}

class NetworkError extends Error {
  constructor(message: string) {
    super();
    this.name = 'NetWorkError';
    this.message = message;
  }
}

class RequestError extends Error {
  constructor(message: string) {
    super();
    this.name = 'RequestError';
    this.message = message;
  }
}

export { InternalError, NetworkError, RequestError };
