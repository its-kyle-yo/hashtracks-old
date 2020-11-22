import twitter from 'twitter-text'
import faker from 'faker';
import { Factory } from 'rosie';
import { Entities, ExtendedEntities, ExtendedTweet } from "./entities";
import { Chance } from "chance";
import { media_types } from "../post";
import { media } from './entities';
import UserFactory from './user';

const [UserOne, UserTwo] = UserFactory().buildList(2);

export const TWEET_TYPES = {
  PHOTO: media_types.PHOTO,
  VIDEO: media_types.VIDEO,
  GIF: media_types.GIF,
  TEXT_ONLY: 'text_only'
}

export const makeTypeString = (chanceType, numberOfType) => {
  return [...Array(numberOfType)].map(() => new Chance()[chanceType]().substring(0, 3)).join(' ')
}

export const makeUrlString = (numberOfUrls, urlLength) => {
  return [...Array(numberOfUrls)].map(() => `http://${new Chance().word({ length: urlLength })}.com`).join(' ')
}

export const makeMediaUrlString = (numberOfUrls = 4, type) => {
  if (type === TWEET_TYPES.PHOTO) {
    return [...Array(numberOfUrls)].map(() => media[type].image_url).join(' ')
  }

  if (type !== TWEET_TYPES.TEXT_ONLY) {
    return media[type].image_url
  }

  return ''
}

export default () => {
  return new Factory()
    .attr('created_at', faker.date.past())
    .sequence('id', id => parseInt(id))
    .attr('id_str', ['id'], id => id.toString())
    .option('tweet_type', TWEET_TYPES.GIF)
    .option('extended', false)
    .option('characters', new Chance().word({ length: 5 }))
    .option('truncated_text', new Chance().word({ length: 137 }) + '...')
    .option('emoji', '💩🚀🤷‍♂️🤦‍♂️')
    .option('mentions', makeTypeString('twitter', 2))
    .option('hashtags', makeTypeString('hashtag', 2))
    .option('media_urls', ['tweet_type'], tweet_type => makeMediaUrlString(4, tweet_type))
    .option('urls', makeUrlString(2, 4))
    .option('extended_text',
      ['characters', 'emoji', 'mentions', 'hashtags', 'urls', 'media_urls'],
      (characters, emoji, mentions, hashtags, urls, media_urls) => {
        return `${characters} ${emoji} ${mentions} ${hashtags} ${urls} ${media_urls}`
      })
    .attr('text',
      ['tweet_type', 'extended', 'truncated_text', 'extended_text'],
      (tweet_type, extended, truncated_text, extended_text) => {
        if (Object.is(tweet_type, TWEET_TYPES.TEXT_ONLY) && !extended) {
          return new Chance().word({ length: 140 });
        }

        if (extended) {
          return truncated_text;
        }

        return extended_text;
      })
    .attr('display_text_range', ['text'], text => {
      const { displayRangeStart, displayRangeEnd } = twitter.parseTweet(text);
      return [displayRangeStart, displayRangeEnd];
    })
    .attr('source', '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>')
    .attr('truncated', ['extended'], extended => extended)
    .option('is_reply', false)
    .attr('reply_status', ['is_reply', 'id'], (is_reply, id) => (
      is_reply
        ? QuoteTweet(id).build()
        : null
    ))
    .attr('in_reply_to_status_id', ['is_reply', 'reply_status'], (isReply, replyStatus) => isReply ? replyStatus.id : null)
    .attr('in_reply_to_status_id_str', ['is_reply', 'reply_status'], (isReply, replyStatus) => isReply ? replyStatus.id_str : null)
    .attr('in_reply_to_user_id', ['is_reply'], isReply => isReply ? UserTwo.id : null)
    .attr('in_reply_to_user_id_str', ['is_reply'], isReply => isReply ? UserTwo.id_str : null)
    .attr('in_reply_to_screen_name', ['is_reply'], isReply => isReply ? UserTwo.screen_name : null)
    .attr('user', UserOne)
    .attr('coordinates', new Chance().coordinates().split(',').map(point => point.trim()))
    .attr('place', null)
    .option('quote_tweet', false)
    .attr('is_quote_status', ['quote_tweet'], quote_tweet => quote_tweet)
    .attr('quoted_status', ['quote_tweet', 'id'], (quote_tweet, id) => (
      quote_tweet
        ? QuoteTweet(id).build({ retweeted: false })
        : null
    ))
    .attr('quoted_status_id', ['quote_tweet', 'quoted_status'], (isQuoteTweet, status) => isQuoteTweet ? status.id : null)
    .attr('quoted_status_id_str', ['quote_tweet', 'quoted_status'], (isQuoteTweet, status) => isQuoteTweet ? status.id_str : null)
    .option('is_retweet', false)
    .attr('retweeted_status', ['is_retweet', 'id'], (is_retweet, id) => {
      is_retweet
        ? QuoteTweet(id).build()
        : null
    })
    .attr('quote_count', faker.random.number())
    .attr('reply_count', faker.random.number())
    .attr('retweet_count', faker.random.number())
    .attr('entities',
      ['tweet_type', 'text', 'media_urls', 'in_reply_to_status_id', 'in_reply_to_user_id'],
      (tweet_type, text, media_urls, in_reply_to_status_id, in_reply_to_user_id) =>
        Entities(tweet_type, text, media_urls, in_reply_to_status_id, in_reply_to_user_id).build()
    )
    .attr('extended_entities', ['tweet_type', 'entities'], (tweet_type, { media }) => {
      if (![TWEET_TYPES.PHOTO, TWEET_TYPES.TEXT_ONLY].includes(tweet_type)) {
        return ExtendedEntities(tweet_type, media).build()
      }
    })
    .attr('favorited', false)
    .attr('retweeted', false)
    .attr('possibly_sensitive', false)
    .attr('lang', 'en')
    .attr('extended_tweet', ['extended_text', 'entities'], (extended_text, entities) => ExtendedTweet(extended_text, entities).build())
    .after((tweet, options) => {
      // Options are only present if the tweet is a quote status
      if (Object.is(options.quote_tweet, false)) {
        delete tweet.quoted_status;
        delete tweet.quoted_status_id;
        delete tweet.quoted_status_id_str;
      }

      // Option is only present if links are in tweet
      if (Object.is(options.tweet_type, TWEET_TYPES.TEXT_ONLY)) {
        delete tweet.possibly_sensitive;
      }

      if (Object.is(options.tweet_type, TWEET_TYPES.PHOTO)) {
        delete tweet.extended_entities;
      }

      if (Object.is(options.extended, true)) {
        tweet.entities.hashtags = [];
      } else {
        delete tweet.extended_tweet
      }
    })
}

const QuoteTweet = (other_id) => {
  return new Factory()
    .attr('created_at', faker.date.past())
    .sequence('id', id => parseInt(id) + other_id)
    .attr('id_str', ['id'], id => id.toString())
    .option('tweet_type', TWEET_TYPES.GIF)
    .option('extended', false)
    .option('characters', new Chance().word({ length: 5 }))
    .option('truncated_text', new Chance().word({ length: 137 }) + '...')
    .option('emoji', '💩🚀🤷‍♂️🤦‍♂️')
    .option('mentions', [...Array(2)].map(() => new Chance().twitter().substring(0, 3)).join(' '))
    .option('hashtags', [...Array(2)].map(() => new Chance().hashtag().substring(0, 3)).join(' '))
    .option('extended_text',
      ['characters', 'emoji', 'mentions', 'hashtags', 'urls', 'media_urls'],
      (characters, emoji, mentions, hashtags, urls, media_urls) => {
        return `${characters} ${emoji} ${mentions} ${hashtags} ${urls} ${media_urls}`
      })
    .option('media_urls', ['tweet_type'], tweet_type => {
      if (tweet_type === TWEET_TYPES.PHOTO) {
        return [...Array(4)].map(() => media[tweet_type].image_url).join(' ')
      }

      if (tweet_type !== TWEET_TYPES.TEXT_ONLY) {
        return media[tweet_type].image_url
      }

      return ''
    })
    .option('urls', [...Array(2)].map(() => `http://${new Chance().word({ length: 4 })}.com`).join(' '))
    .attr('text',
      ['tweet_type', 'extended', 'truncated_text', 'extended_text'],
      (tweet_type, extended, truncated_text, extended_text) => {
        if (Object.is(tweet_type, TWEET_TYPES.TEXT_ONLY) && !extended) {
          return new Chance().word({ length: 140 });
        }

        if (extended) {
          return truncated_text;
        }

        return extended_text;
      })
    .attr('display_text_range', ['text'], text => {
      const { displayRangeStart, displayRangeEnd } = twitter.parseTweet(text);
      return [displayRangeStart, displayRangeEnd];
    })
    .attr('source', '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>')
    .attr('truncated', ['extended'], extended => extended)
    .attr('user', UserTwo)
    .attr('coordinates', new Chance().coordinates().split(',').map(point => point.trim()))
    .attr('place', null)
    .attr('quote_count', faker.random.number())
    .attr('reply_count', faker.random.number())
    .attr('retweet_count', faker.random.number())
    .attr('favorite_count', faker.random.number())
    .attr('entities', {})
    .attr('extended_entities', {})
    .attr('favorited', true)
    .attr('retweeted', true)
    .attr('possibly_sensitive', false)
    .attr('lang', 'en')
}