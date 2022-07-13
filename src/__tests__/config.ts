import chai from 'chai';
import chaiShallowDeepEqual from 'chai-shallow-deep-equal';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import middleware from '../middleware';
import configureMockStore from 'redux-mock-store';

chai.use(chaiShallowDeepEqual);

const client = axios.create({
    responseType: 'json',
});

export const mockAxiosClient = new MockAdapter(client);
const mockStore = configureMockStore([middleware(client)]);
export const store = mockStore();

export default chai;