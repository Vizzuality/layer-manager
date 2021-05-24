import isEmpty from '../src/isEmpty';

describe('isEmpty', () => {
  it('object should be empty', () => {
    expect(isEmpty({})).toBe(true);
  });

  it('object should not be empty', () => {
    expect(isEmpty({ a: 1 })).toBe(false);
  });
});
