import isEmpty from '../src/isEmpty';

describe('isEmpty', () => {
  it('object should be empty', () => {
    expect(isEmpty({})).toBeTruthy;
  });

  it('object should not be empty', () => {
    expect(isEmpty({ a: 1 })).toBeFalsy;
  });
});
