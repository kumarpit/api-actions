import chai, { mockAxiosClient, store, defaultHeader } from './config';
import { createAPIAction } from '../utils';

const expect = chai.expect;

describe('network', () => {
  afterEach(() => {
    mockAxiosClient.reset();
    store.clearActions();
  });

  it('should recieve axios default config', async () => {
    mockAxiosClient.onGet('/test').reply((config) => {
      if (config.headers && config.headers['authorization'] === defaultHeader) {
        return [200, 'success'];
      } else {
        return [403];
      }
    });

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'SUCCESS_ACTION_TYPE',
        payload: 'success',
      },
    ];

    await store.dispatch({
      ...createAPIAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });

  it('should override axios defaults if got custom config', async () => {
    mockAxiosClient.onGet('/test').reply((config) => {
      if (config.headers && config.headers['authorization'] === 'not default') {
        return [200, 'success'];
      } else {
        return [403];
      }
    });

    const expectActions = [
      {
        type: 'REQUEST_ACTION_TYPE',
      },
      {
        type: 'SUCCESS_ACTION_TYPE',
        payload: 'success',
      },
    ];

    await store.dispatch({
      ...createAPIAction({
        path: '/test',
        types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
        config: {
          headers: {
            authorization: 'not default',
          },
        },
      }),
      type: 'TESTING',
    });

    expect(store.getActions()).shallowDeepEqual(expectActions);
  });
});
