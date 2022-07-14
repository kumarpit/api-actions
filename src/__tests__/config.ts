import chai from 'chai';
import chaiShallowDeepEqual from 'chai-shallow-deep-equal';
import deepEqualInAnyOrder from 'deep-equal-in-any-order';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import middleware from '../middleware';
import configureMockStore from 'redux-mock-store';

chai.use(chaiShallowDeepEqual);
chai.use(deepEqualInAnyOrder);

export const defaultHeader = '@@api-actions-test';
const client = axios.create({
  responseType: 'json',
  headers: {
    authorization: defaultHeader,
  },
});

export const mockAxiosClient = new MockAdapter(client);
const mockStore = configureMockStore([middleware(client)]);
export const store = mockStore();

export default chai;
