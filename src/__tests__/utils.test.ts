import chai from './config';
import { createAPIAction } from '../utils';
import { RSAA } from '../types';

const expect = chai.expect;

describe('utils', () => {
  it('should inject default values', () => {
    const actual = createAPIAction({
      path: '/test',
      types: ['REQ', 'SUCCESS', 'FAIL'],
    });
    const expected = {
      [RSAA]: {
        method: 'GET',
        path: '/test',
        types: ['REQ', 'SUCCESS', 'FAIL'],
      },
      type: RSAA,
    };

    expect(actual).to.deep.equalInAnyOrder(expected);
  });

  // it('should return default descriptor if SUCCESS_TYPE is a string', () => {
  //     const actual = normalizeTypeDescriptors(['R', 'S', 'F']);
  //     const expected = [{ type: 'R' }, { type: 'S', payload: (_: any, res: AxiosResponse) => res.data }, { type: 'F' }]
  //     expect(actual).to.deep.equalInAnyOrder(expected);
  // })
});
