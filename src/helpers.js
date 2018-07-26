import Promise from 'bluebird';
import compact from 'lodash/compact';

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

export const substitution = (string, params = {}) => {
  // Params should have this format => { key:'xxx', key2:'xxx' }
  // Keys to search should be in this format {{key}}
  let str = string;

  Object.keys(params).forEach((key) => {
    str = str.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
    str = str.replace(new RegExp(`{${key}}`, 'g'), params[key]);
  });
  return str;
};

export const concatenation = (string, params = {}) => {
  // Params should have this format => { where1: { { key:'xxx', key2:'xxx' } }},
  // Keys to search should be in this format {{key}}
  let str = string;
  let sql;

  Object.keys(params).forEach((key) => {
    sql = `${compact(Object.keys(params[key]).map((k) => {
      const value = params[key][k];

      if (value) {
        /* eslint-disable-next-line */
        return (isNaN(value)) ? `${k} = '${value}'` : `${k} = ${value}`;
      }
      return null;
    })).join(' AND ')}`;

    if (sql && key.startsWith('where')) sql = `WHERE ${sql}`;
    else if (sql && key.startsWith('and')) sql = `AND ${sql}`;
    else sql = '';

    str = str.replace(new RegExp(`{{${key}}}`, 'g'), sql);
    str = str.replace(new RegExp(`{${key}}`, 'g'), sql);
  });

  return str;
};

export const replace = (string, params = {}, sqlParams = {}) => {
  let str = string;

  if (typeof str === 'string') {
    str = substitution(str, params);
    str = concatenation(str, sqlParams);
  }

  return str;
};

export default { get, post, substitution, concatenation, replace };
