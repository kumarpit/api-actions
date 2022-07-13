import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import { expect } from 'chai';
import MockAdapter from 'axios-mock-adapter';
import middleware from '../middleware';
import { createAction } from '../utils';
import chai from 'chai'
import chaiShallowDeepEqual from 'chai-shallow-deep-equal';
import { InternalError, NetworkError, RequestError } from '../errors';

chai.use(chaiShallowDeepEqual);

const client = axios.create({
  responseType: 'json'
});

const mockAxiosClient = new MockAdapter(client);
const mockStore = configureMockStore([middleware(client)]);

describe('middleware', () => {
    afterEach(() => {
        mockAxiosClient.reset()
    })

    after(() => {
        mockAxiosClient.restore()
    })

    it('should dispatch SUCCESS_ACTION_TYPE', async () => {
        mockAxiosClient.onGet('/test').reply(200, 'response');

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'SUCCESS_ACTION_TYPE',
            payload: 'response'
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE']
            }), type: 'TESTING'})
        
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })

    it('should dispatch response described by descriptor', async () => {
        mockAxiosClient.onGet('/test').reply(200, 'response');

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'SUCCESS_ACTION_TYPE',
            payload: { data: 'response' }
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', { type: 'SUCCESS_ACTION_TYPE', payload: (_, res) => res }, 'FAIL_ACTION_TYPE']
            }), type: 'TESTING'})
        
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })

    it('should dispatch FAIL_ACTION_TYPE on RequestError', async () => {
        mockAxiosClient.onGet('/test').reply(404);

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'FAIL_ACTION_TYPE',
            payload: new RequestError('RequestError: Request failed with status code 404', {}),
            error: true
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE']
            }), type: 'TESTING'})
        
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })

    it('should dispatch FAIL_ACTION_TYPE on NetworkError', async () => {
        mockAxiosClient.onGet('/test').networkError();

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'FAIL_ACTION_TYPE',
            payload: new NetworkError('RequestError: Request failed with status code 404', {}),
            error: true
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE']
            }), type: 'TESTING'})
        
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })

    it('should dispatch FAIL_ACTION_TYPE on InternalError - failing descriptor payload function', async () => {
        mockAxiosClient.onGet('/test').reply(200, 'response');

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'FAIL_ACTION_TYPE',
            payload: new InternalError('descriptor.payload function error', {}),
            error: true
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', { type: 'SUCCESS_ACTION_TYPE', payload: (state,_) => state().auth.token }, 'FAIL_ACTION_TYPE']
            }), type: 'TESTING'})
        
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })

    it('should dispatch FAIL_ACTION_TYPE on InternalError - failing onReqSuccess function', async () => {
        mockAxiosClient.onGet('/test').reply(200, 'response');

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'FAIL_ACTION_TYPE',
            payload: new InternalError('`onReqSuccess` function error', {}),
            error: true
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
                onReqSuccess: ({ getState, dispatch }, res, axios) => getState().auth.token,
            }), type: 'TESTING'})
            
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })

    it('should dispatch FAIL_ACTION_TYPE on InternalError - failing onReqFail function', async () => {
        mockAxiosClient.onGet('/test').reply(400);

        const expectActions = [{
            type: 'REQUEST_ACTION_TYPE'
        }, {
            type: 'FAIL_ACTION_TYPE',
            payload: new InternalError('`onReqFail` function error', {}),
            error: true
        }]


        const store = mockStore();
        await store.dispatch({...createAction({
                path: '/test',
                method: 'GET',
                types: ['REQUEST_ACTION_TYPE', 'SUCCESS_ACTION_TYPE', 'FAIL_ACTION_TYPE'],
                onReqFail: ({ getState, dispatch }, err, axios) => getState().auth.token,
            }), type: 'TESTING'})
            
        expect(store.getActions()).shallowDeepEqual(expectActions)
    })
})