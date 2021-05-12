<<<<<<< HEAD
export { default } from './src/carto-provider';

=======
>>>>>>> 3eacbe8... added types on package.json; added test for carto provider
export type CartoData = {
  cdn_url: {
    templates: {
      https: {
        url: string
      }
    }
  }
  layergroupid: string
}

export type CartoLayer = {
  options: Record<string, unknown>
  interactivity: unknown
}

export type CartoProvider = {
  account: string
  api_key: string
  layers: CartoLayer[]
  options?: Record<string, unknown>
  type: 'carto'
}

export type CartoParams = {
  stat_tag: 'API'
  config: string
  api_key?: string
}
