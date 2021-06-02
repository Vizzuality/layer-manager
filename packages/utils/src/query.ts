import type { Params } from '@vizzuality/layer-manager';
import type { QueryParams, WhereQueryParams } from '../types';

type UtilsParams = Params | QueryParams;

/**
 * Params should have this format => { key:'xxx', key2:'xxx' }
 * Keys to search should be in this format {{key}}
 *
 * @param {String} originalStr
 * @param {Object} params
 */
export const substitution = (originalStr: string, params: UtilsParams = {}): string => {
  let str = originalStr;

  Object.keys(params).forEach((key) => {
    const value = params[key] as string;
    const isObject = value != null
      && typeof value === 'object'
      && Object.prototype.toString.call(value) === '[object Object]';

    if (Array.isArray(value) || isObject) {
      str = str
        .replace(new RegExp(`"{{${key}}}"`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`'{{${key}}}'`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`\`{{${key}}}\``, 'g'), JSON.stringify(value))
        .replace(new RegExp(`"{${key}}"`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`'{${key}}'`, 'g'), JSON.stringify(value))
        .replace(new RegExp(`\`{${key}}\``, 'g'), JSON.stringify(value));
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      str = str
        .replace(new RegExp(`"{{${key}}}"`, 'g'), value)
        .replace(new RegExp(`'{{${key}}}'`, 'g'), value)
        .replace(new RegExp(`\`{{${key}}}\``, 'g'), value)
        .replace(new RegExp(`"{${key}}"`, 'g'), value)
        .replace(new RegExp(`'{${key}}'`, 'g'), value)
        .replace(new RegExp(`\`{${key}}\``, 'g'), value);
    }

    str = str
      .replace(new RegExp(`{{${key}}}`, 'g'), value.toString())
      .replace(new RegExp(`{${key}}`, 'g'), value.toString());
  });
  return str;
};

/**
 * Params should have this format => { where1: { { key:'xxx', key2:'xxx' } }},
 * Keys to search should be in this format {{key}}
 * @param {String} originalStr
 * @param {Object} params
 */
export const concatenation = (originalStr: string, params: WhereQueryParams = {}): string => {
  let result = originalStr;

  Object.keys(params).forEach((key) => {
    let sql = `${Object.keys(params[key])
      .map((k) => {
        const value = params[key][k];

        if (Array.isArray(value) && !!value.length) {
          const mappedValue = value.map((v) => (typeof v !== 'number' ? `'${v}'` : v));
          return `${k} IN (${mappedValue.join(', ')})`;
        }

        if (!Array.isArray(value) && value) {
          return typeof value !== 'number' ? `${k} = '${value}'` : `${k} = ${value}`;
        }

        return null;
      })
      .filter((value) => !!value)
      .join(' AND ')}`;

    if (sql && key.startsWith('where')) sql = `WHERE ${sql}`;
    else if (sql && key.startsWith('and')) sql = `AND ${sql}`;
    else sql = '';

    result = substitution(result, { [key]: sql });
  });

  return result;
};

/**
 * Replace function
 * @param {String} string
 * @param {Object} params
 * @param {Object} sqlParams
 */
export const replace = (
  originalStr: string,
  params: UtilsParams = {},
  sqlParams: WhereQueryParams = {},
): string => {
  let str = originalStr;

  if (typeof str === 'string') {
    str = substitution(str, params);
    str = concatenation(str, sqlParams);
  }

  return str;
};

export default { substitution, concatenation, replace };
