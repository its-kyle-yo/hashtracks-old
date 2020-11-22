// Modules
import twitter from 'twitter-text'

// Helpers
import { TweetObject } from 'twitter'
import { FormattedPost } from 'CustomTypes'
import isOwnTweet from './isOwnTweet'
import formatMedia from './formatMedia'
import filterArrayDuplicates from './filterArrayDuplicates'

// Types

/**
 * Formats and filters content from a given user activity create event
 * and condenses it to a usable format for our database
 * @param tweet
 */
const formatTweet = (tweet: TweetObject): Omit<FormattedPost, 'authorID'> | false => {
  const isUsersTweet = isOwnTweet(tweet)

  if (isUsersTweet) {
    // 1. Create a new date instance for our deconstructed date (used in frontend)
    const date = new Date(tweet.created_at)
    // 2. Establish defaults and easy to grab values
    const formattedTweet: Omit<FormattedPost, 'authorID'> = {
      twitterPostID: tweet.id_str,
      createdAt: date.toISOString(),
      deconstructedDate: JSON.stringify({
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear(),
      }),
      text: tweet.text || ``,
      source: `https://twitter.com/${tweet?.user?.screen_name}/status/${tweet.id_str}`,
      hashtags: twitter.extractHashtags(tweet.text),
      media: [],
    }

    // 3. Grab the media content if any
    // 3a. If the property extended_tweet exists on the object we ALWAYS
    // want to use it as the source of truth for media and text
    if (tweet.extended_tweet) {
      const { entities, extended_entities, full_text } = tweet.extended_tweet
      // If extended tweet is present the text on the parent object will be truncated and
      // may not have the full 140+ characters
      formattedTweet.text = full_text

      // 3a.1. Extract and array of hashtag text
      formattedTweet.hashtags = twitter.extractHashtags(full_text)

      // 3a.2. Extract all data for native media provided in the original tweet
      if (extended_entities?.length) {
        const formattedMedia = extended_entities.media?.map(formatMedia)
        const mergedMedia = formattedMedia.concat(formattedMedia)
        formattedTweet.media = mergedMedia
      }

      if (entities?.media?.length) {
        const formattedMedia = entities.media.map(formatMedia)
        const mergedMedia = formattedMedia.concat(formattedMedia)
        formattedTweet.media = mergedMedia
      }
    }
    // 3b. If the extended tweet does not exist ( >= 140 characters in the text)
    if (tweet?.extended_entities?.media?.length && !tweet.extended_tweet) {
      // 3b.1. Extract any non-picture native media (GIF/Video)
      // NOTE: Currently only one piece of animated native media is supported for tweets however looping through it is to future proof
      const formattedMedia = tweet.extended_entities.media.map(formatMedia)
      const mergedMedia = formattedMedia.concat(formattedMedia)
      formattedTweet.media = mergedMedia
    } else if (tweet?.entities?.media?.length) {
      // 3b.2. Extract any included native media [Photos only]
      const formattedMedia = tweet.entities.media.map(formatMedia)
      const mergedMedia = formattedMedia.concat(formattedMedia)
      formattedTweet.media = mergedMedia
    }


    // 4. Convert all linkable text into HTML anchors
    formattedTweet.text = twitter.autoLink(formattedTweet.text)

    // 5. Remove any potentially added duplicates due to duplicates from extended_entities/entities
    formattedTweet.media = filterArrayDuplicates(formattedTweet.media, `twitterMediaID`)
    return formattedTweet
  }

  return isUsersTweet
}

export default formatTweet
