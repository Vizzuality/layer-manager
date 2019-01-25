import { expect } from 'chai';
import { get } from '../../src/helpers';

describe('# Cancellable request', () => {
  it('get is cancellable', (done) => {
    const request = get('http://api.resourcewatch.org/v1/layer?application=rw&page[size]=1&page[number]=1');

    let result = null;

    request
      .then((res) => {
        if (res.status > 400) {
          console.error(res);
          return false;
        }
        return JSON.parse(res.response);
      })
      .then((json) => {
        result = json;
        return result;
      })
<<<<<<< Updated upstream
=======
      .catch((err) => {
        if (!request.isCancelled()) result = 1;
        expect(result).to.equal(null);
        done();
        console.error(err);
      })
>>>>>>> Stashed changes
      .then(() => {
        if (!request.isCancelled()) result = 1;
        expect(result).to.equal(null);
        done();
      });

    setTimeout(() => request.cancel(), 30);
  });
});
