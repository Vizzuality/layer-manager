import { omit } from '../src';

describe('isEmpty', () => {
  it('object should be empty', () => {
    expect(omit('a', { a: 1, b: 2 })).toEqual({ b: 2 });
  });
});
