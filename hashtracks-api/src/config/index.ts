import dotenv from 'dotenv'

/**
 * Imports config information from the top-level .env file and applies them to
 * to process.env
 */
dotenv.config()


// This makes config information easier to access in an exportable fashion
// TODO: Convert config export to export individual pieces rather than files importing the entire config object
const config = {
  port: process.env.PORT,
  database: {
    url: process.env.DATABASE_URL,
  },
  twitter: {
    serverUrl: process.env.TWITTER_SERVER_URL,
    route: process.env.TWITTER_WEBHOOK_ROUTE,
    consumerKey: process.env.TWITTER_CONSUMER_KEY,
    consumerSecret: process.env.TWITTER_CONSUMER_SECRET,
    accessToken: process.env.TWITTER_ACCESS_TOKEN,
    accessTokenSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
    environment: process.env.TWITTER_APP_ENVIRONMENT,
    appBearerToken: process.env.TWITTER_APP_BEARER_TOKEN,
  },
  prisma: {
    debug: process.env.PRISMA_ENABLE_DEBUG ?? false,
  },
  node: {
    env: process.env.NODE_ENV,
  },
  redis: {
    url: process.env.REDIS_URL,
  },
}

export default config
