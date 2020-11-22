import dotenv from 'dotenv';

dotenv.config();

export default {
  port: process.env.PORT,
  database: {
    url: process.env.MONGODB_URI,
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
    apiUrl: process.env.TWITTER_API_BASE_URL
  },
  node: {
    env: process.env.NODE_ENV,
  },
  redis: {
    url: process.env.REDIS_URL
  }
};
