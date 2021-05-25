export {
  fetch, replace, concatenation, substitution, isEmpty, omit,
} from './src';

export type QueryParams = {
  [key:string]: string;
};

export type WhereQueryParams = {
  [key: string]: Record<string, unknown | unknown[]>
};
