// Types
import { TweetObject } from 'twitter'

/**
 * Defines if a Tweet event originates from the defined users account rather than a secondary source
 * @param tweet
 */
const isOwnTweet = (tweet: TweetObject): boolean => (!tweet.is_quote_status && !tweet.retweeted_status)

export default isOwnTweet
