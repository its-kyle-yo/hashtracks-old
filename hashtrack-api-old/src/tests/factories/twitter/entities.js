import faker from 'faker';
import twitter from 'twitter-text'
import { Chance } from 'chance';
import { Factory } from 'rosie';
import { TWEET_TYPES } from './tweet'
import { media_types } from "../post";

export const media = {
  [media_types.GIF]: {
    image_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
    video_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
  },
  [media_types.VIDEO]: {
    image_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/200_s.gif",
    video_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/giphy.mp4",
  },
  [media_types.PHOTO]: {
    image_url: faker.image.imageUrl(),
    video_url: null,
  }
}

export const UserMentionsEntity = (mention, idOffset, user_id) => {
  return new Factory()
    .attr('id', user_id + idOffset)
    .attr('id_str', (user_id + idOffset).toString())
    .attr('screen_name', mention.screenName)
    .attr('name', mention.screenName)
    .attr('indices', mention.indices)
};

export const UrlsEntity = (url, indices) => {
  return new Factory()
    .attr('url', url)
    .attr('expanded_url', url)
    .attr('display_url', url)
    .attr('indices', indices)
};

export const MediaEntity = (tweet_type, media_payload) => {
  const { url, indices, status_id } = media_payload;
  if (tweet_type !== TWEET_TYPES.TEXT_ONLY) {
    return new Factory()
      .attr('display_url', url)
      .attr('expanded_url', url)
      .sequence('id')
      .attr('id_str', ['id'], id => id.toString())
      .attr('indices', indices)
      .attr('media_url', url)
      .attr('media_url_https', url.replace('http', 'https'))
      .attr('sizes', Sizes().build())
      .attr('source_status_id', status_id ? parseInt(status_id, 10) : null)
      .attr('source_status_id_str', status_id ? status_id.toString() : null)
      .attr('type', TWEET_TYPES.PHOTO)
      .attr('url', faker.internet.url())
  }
};

export const Sizes = () => {
  const [t, s, m, l] = Size().buildList(4)
  return new Factory()
    .attr('thumb', t)
    .attr('small', s)
    .attr('medium', m)
    .attr('large', l)
}

export const Size = () => {
  return new Factory()
    .attr('w', faker.random.number())
    .attr('h', faker.random.number())
    .attr('resize', new Chance().pickone(['fit', 'crop']))
}

export const ExtendedEntities = (tweet_type, mediaEntity) => {
  return new Factory()
    .attr('media', () => {
      return mediaEntity.map(mediaObj => ({
        ...mediaObj,
        type: tweet_type,
        video_info: {
          aspect_ratio: [],
          duration_millis: 0,
          variants: [
            {
              bitrate: 0,
              content_type: 'video/mp4',
              url: media[tweet_type].video_url
            }
          ]
        }
      }))
    })
}

export const ExtendedTweet = (text, entities) => {
  return new Factory()
    .attr('full_text', text)
    .attr('display_text_range', () => {
      const { displayRangeStart, displayRangeEnd } = twitter.parseTweet(text);
      return [displayRangeStart, displayRangeEnd]
    })
    .attr('entities', entities)
}

export const Entities = (tweet_type, text, media_urls, status_id, user_id) => {
  const extractedHashtags = twitter.extractHashtagsWithIndices(text);
  const extractedUrls = twitter.extractUrlsWithIndices(text);
  const extractedMentions = twitter.extractMentionsWithIndices(text);

  return new Factory()
    .attr('hashtags', extractedHashtags.map(({ hashtag, indices }) => ({ text: hashtag, indices })))
    .attr('media',
      tweet_type !== 'text_only'
        ? extractedUrls
          .filter(({ url }) => media_urls.includes(url))
          .map(({ url, indices }, index) => {
            return MediaEntity(tweet_type, { url, indices, status_id, user_id }).build({ id: index + 1 });
          })
        : []
    )
    .attr('urls',
      extractedUrls
        .filter(({ url }) => !media_urls.includes(url))
        .map(({ url, indices }) => {
          return UrlsEntity(url, indices).build()
        })
    )
    .attr('user_mentions', extractedMentions.map((mention, index) => {
      return UserMentionsEntity(mention, index, user_id).build()
    }))
}