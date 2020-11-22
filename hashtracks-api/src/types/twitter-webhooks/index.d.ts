
declare module 'twitter-webhooks' {
  import { Application } from 'express'

  export function userActivity(config: UserActivityConfig): unknown
  export interface UserActivityConfig {
    serverUrl: string | undefined
    route: string | undefined
    consumerKey: string | undefined
    consumerSecret: string | undefined
    accessToken: string | undefined
    accessTokenSecret: string | undefined
    environment: string | undefined
    appBearerToken: string | undefined
    app: Application
  }

  export interface TwitterWebhook {
    id: string
    url: string
    valid: boolean
    created_timestamp: string
  }
}
