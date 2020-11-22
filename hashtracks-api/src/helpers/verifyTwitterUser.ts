// Modules
import request from 'request-promise-native'
import { timingSafeEqual } from 'crypto'

// Config
import config from '@config'

// Types
import { TwitterCredentials } from 'twitter'

// Helpers
import deepLogObject from './deepLogObject'

/**
 * Verifies if a user is real from asking Twitter based on their Twitter credentials
 * @param credentials
 */
const verifyTwitterUser = async (credentials: TwitterCredentials, idMatch: string) => {
  const { accessToken: userToken, secret: userSecret } = credentials
  const { consumerKey, consumerSecret } = config.twitter
  const url = `https://api.twitter.com/1.1/account/verify_credentials.json?skip_status=true`
  const response = await request.get({
    url,
    resolveWithFullResponse: true,
    oauth: {
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
      token: userToken,
      token_secret: userSecret,
    },
  })

  deepLogObject(response)

  return (
    (response.statusCode === 200)
    && timingSafeEqual(Buffer.from(response.twitter_user_id), Buffer.from(idMatch))
  )
}

export default verifyTwitterUser
