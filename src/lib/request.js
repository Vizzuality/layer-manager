import axios from 'axios';

const headers = {
  'Content-Type': 'application/json'
};

export const get = (url, options = {}) =>
  axios.get(url, {
    headers,
    ...options
  });

export const post = (url, body) => axios.post(url, body, { headers });

export default { get, post };
