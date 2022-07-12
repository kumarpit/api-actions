import axios from 'axios';
import configureMockStore from 'redux-mock-store';
import { expect } from 'chai';
import MockAdapter from 'axios-mock-adapter';
import middleware from '../middleware';
import { createAction } from '../utils';
import chai from 'chai'
import chaiShallowDeepEqual from 'chai-shallow-deep-equal';

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
})