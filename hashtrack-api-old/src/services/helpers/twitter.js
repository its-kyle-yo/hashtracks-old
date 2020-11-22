import config from '@config';
import request from 'request-promise-native';

const { apiUrl, consumerKey, consumerSecret, environment } = config.twitter;

export const isSubscribed = async (credentials) => {
  const { accessToken, secret } = credentials;
  const url = `${apiUrl}/account_activity/all/${environment}/subscriptions.json`;
  const response = await request.get({
    url,
    resolveWithFullResponse: true,
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: accessToken,
      token_secret: secret,
    }
  })

  return (response.statusCode === 204)
}

export const verifyTwitterUser = async (credentials) => {
  const { accessToken, secret } = credentials;
  const url = `${apiUrl}/account/verify_credentials.json?skip_status=true`
  const response = await request.get({
    url,
    resolveWithFullResponse: true,
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: accessToken,
      token_secret: secret,
    }
  })

  return (response.statusCode === 200);
}

export default { verifyTwitterUser, isSubscribed }