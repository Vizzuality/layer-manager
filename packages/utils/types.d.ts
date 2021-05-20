export { fetch, replace, concatenation, substitution } from './src';

export type QueryParams = {
  [key:string]: string;
}

export type WhereQueryParams = {
  [key: string]: Record<string, unknown | unknown[]>
}
