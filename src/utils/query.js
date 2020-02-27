import compact from 'lodash/compact';
import isObject from 'lodash/isObject';

/**
 * Params should have this format => { key:'xxx', key2:'xxx' }
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
export const substitution = (originalStr, params = {}) => {
  let str = originalStr;
  Object.keys(params).forEach(key => {
    if (Array.isArray(params[key]) || isObject(params[key])) {
      str = str
        .replace(new RegExp(`"{{${key}}}"`, 'g'), JSON.stringify(params[key]))
        .replace(new RegExp(`'{{${key}}}'`, 'g'), JSON.stringify(params[key]))
        .replace(new RegExp(`\`{{${key}}}\``, 'g'), JSON.stringify(params[key]))
        .replace(new RegExp(`"{${key}}"`, 'g'), JSON.stringify(params[key]))
        .replace(new RegExp(`'{${key}}'`, 'g'), JSON.stringify(params[key]))
        .replace(new RegExp(`\`{${key}}\``, 'g'), JSON.stringify(params[key]));
    }

    if (typeof params[key] === 'number' || typeof params[key] === 'boolean') {
      str = str
        .replace(new RegExp(`"{{${key}}}"`, 'g'), params[key])
        .replace(new RegExp(`'{{${key}}}'`, 'g'), params[key])
        .replace(new RegExp(`\`{{${key}}}\``, 'g'), params[key])
        .replace(new RegExp(`"{${key}}"`, 'g'), params[key])
        .replace(new RegExp(`'{${key}}'`, 'g'), params[key])
        .replace(new RegExp(`\`{${key}}\``, 'g'), params[key]);
    }

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
          const mappedValue = value.map(v => (typeof v !== 'number' ? `'${v}'` : v));
          return `${k} IN (${mappedValue.join(', ')})`;
        }

        if (!Array.isArray(value) && value) {
          return typeof value !== 'number' ? `${k} = '${value}'` : `${k} = ${value}`;
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
