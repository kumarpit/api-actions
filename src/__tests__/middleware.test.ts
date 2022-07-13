import axios from 'axios';
import chai, { mockAxiosClient, store } from './config';
import { createAction } from '../utils';
import { InternalError, NetworkError, RequestError } from '../errors';

const expect = chai.expect;

describe('middleware', () => {
  afterEach(() => {
    mockAxiosClient.reset();
    store.clearActions();
  });

  after(() => {
    mockAxiosClient.restore();
  });

  it('should dispatch SUCCESS_ACTION_TYPE', async () => {
    mockAxiosClient.onGet('/test').reply(200, 'response');

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'SUCCESS_ACTION_TYPE',
        payload: 'response',
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch response described by descriptor', async () => {
    mockAxiosClient.onGet('/test').reply(200, 'response');

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'SUCCESS_ACTION_TYPE',
        payload: { data: 'response' },
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', { type: 'SUCCESS_ACTION_TYPE', payload: (_, res) => res }, 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should send body defined by [RSAA].body function', async () => {
    mockAxiosClient.onPost('/test').reply(config => {
      const data = JSON.parse(config.data)
      if (data.key === '@@expected') {
        return [200, 'success']
      } else {
        return [400]
      }
    });

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'SUCCESS_ACTION_TYPE',
        payload: { data: 'success' },
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        method: 'POST',
        body: (_) => { return { 'key': '@@expected' } },
        types: ['REQUEST_ACTION_TYPE', { type: 'SUCCESS_ACTION_TYPE', payload: (_, res) => res }, 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch FAIL_ACTION_TYPE on RequestError', async () => {
    mockAxiosClient.onGet('/test').reply(404);

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

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch FAIL_ACTION_TYPE on NetworkError', async () => {
    mockAxiosClient.onGet('/test').networkError();

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'FAIL_ACTION_TYPE',
        payload: new NetworkError('RequestError: Request failed with status code 404', {}),
        error: true,
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch FAIL_ACTION_TYPE on InternalError - failing descriptor payload function', async () => {
    mockAxiosClient.onGet('/test').reply(200, 'response');

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'FAIL_ACTION_TYPE',
        payload: new InternalError('descriptor.payload function error', {}),
        error: true,
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: [
          'REQUEST_ACTION_TYPE',
          { type: 'SUCCESS_ACTION_TYPE', payload: (state, _) => state().auth.token },
          'FAIL_ACTION_TYPE',
        ],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch FAIL_ACTION_TYPE on InternalError - failing onReqSuccess function', async () => {
    mockAxiosClient.onGet('/test').reply(200, 'response');

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'FAIL_ACTION_TYPE',
        payload: new InternalError('`onReqSuccess` function error', {}),
        error: true,
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
        onReqSuccess: ({ getState, dispatch }, res, axios) => getState().auth.token,
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch FAIL_ACTION_TYPE on InternalError - failing onReqFail function', async () => {
    mockAxiosClient.onGet('/test').reply(400);

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'FAIL_ACTION_TYPE',
        payload: new InternalError('`onReqFail` function error', {}),
        error: true,
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
        onReqFail: ({ getState, dispatch }, err, axios) => getState().auth.token,
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should dispatch FAIL_ACTION_TYPE on InternalError - failing [RSAA].body function', async () => {
    mockAxiosClient.onPost('/test').reply(config => {
      const data = JSON.parse(config.data)
      if (data.key === '@@expected') {
        return [200, 'success']
      } else {
        return [400]
      }
    });

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'FAIL_ACTION_TYPE',
        payload: new InternalError('`[RSAA].body` function error', {}),
        error: true
      },
    ];

    await store.dispatch({
      ...createAction({
        path: '/test',
        method: 'POST',
        body: (getState) => { return { 'key': getState().auth.key } },
        types: ['REQUEST_ACTION_TYPE', { type: 'SUCCESS_ACTION_TYPE', payload: (_, res) => res }, 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });
});
