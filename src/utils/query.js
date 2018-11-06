import compact from 'lodash/compact';

/**
 * Params should have this format => { key:'xxx', key2:'xxx' }
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
export const substitution = (originalStr, params = {}) => {
  let str = originalStr;
  Object.keys(params).forEach(key => {
    str = str
      .replace(new RegExp(`{{${key}}}`, 'g'), params[key])
      .replace(new RegExp(`{${key}}`, 'g'), params[key]);
  });
  return str;
};

/**
 * Params should have this format => { where1: { { key:'xxx', key2:'xxx' } }},
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
export const concatenation = (originalStr, params = {}) => {
  let str = originalStr;
  let sql;

  Object.keys(params).forEach(key => {
    sql = `${compact(
      Object.keys(params[key]).map(k => {
        const value = params[key][k];

        if (Array.isArray(value) && !!value.length) {
          // window.isNaN is needed here as Number.isNaN returns
          // false in the case Number.isNaN('string'). please dont change.
          const mappedValue = value.map(v => Number.isNaN(v) ? `'${v}'` : v);
          // eslint-disable-line
          return `${k} IN (${mappedValue.join(', ')})`;
        }

        if (value) {
          return Number.isNaN(value)
            ? `${k} = '${value}'`
            : `${k} = ${value}`; // eslint-disable-line
        }

        return null;
      })
    ).join(' AND ')}`;

    if (sql && key.startsWith('where')) sql = `WHERE ${sql}`;
    else if (sql && key.startsWith('and')) sql = `AND ${sql}`;
    else sql = '';

    str = str.replace(new RegExp(`{{${key}}}`, 'g'), sql);
    str = str.replace(new RegExp(`{${key}}`, 'g'), sql);
  });

  return str;
};

/**
 * Replace function
 * @param {String} string
 * @param {Object} params
 * @param {Object} sqlParams
 */
export const replace = (originalStr, params = {}, sqlParams = {}) => {
  let str = originalStr;

  if (typeof str === 'string') {
    str = substitution(str, params);
    str = concatenation(str, sqlParams);
  }

  return str;
};

export default { substitution, concatenation, replace };
