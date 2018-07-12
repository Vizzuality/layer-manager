import Promise from 'bluebird';

Promise.config({ cancellation: true });

export const get = url => new Promise((resolve, reject, onCancel) => {
  const xhr = new XMLHttpRequest();
  xhr.open('GET', url, true);
  xhr.addEventListener('load', () => resolve(xhr));
  xhr.addEventListener('error', reject);
  xhr.send(null);
  // Note the onCancel argument only exists if cancellation has been enabled!
  onCancel(() => xhr.abort());
});

export const post = (url, params) => new Promise((resolve, reject, onCancel) => {
  const xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/json');
  xhr.addEventListener('load', () => resolve(xhr));
  xhr.addEventListener('error', reject);
  xhr.send(JSON.stringify(params));
  // Note the onCancel argument only exists if cancellation has been enabled!
  onCancel(() => xhr.abort());
});

export const replace = (str, data) => {
  if (typeof str === 'string' && (data instanceof Array)) {
    return str.replace(/({\d})/g, i => data[i.replace(/{/, '').replace(/}/, '')]);
  } else if (typeof str === 'string' && (data instanceof Object)) {
    for (const key in data) {
      return str.replace(/({([^}]+)})/g, (i) => {
        const key = i.replace(/{/, '').replace(/}/, '');
        if (!data[key]) {
          return i;
        }

        return data[key];
      });
    }
  } else {
    return false;
  }
};

export default { get, post, replace };
