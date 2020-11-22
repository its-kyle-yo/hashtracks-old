import twitter from 'twitter-text'

export const createHashtagLink = (hashtag) => {
  return twitter.autoLinkHashtags(hashtag);
}

export const createSourceLink = (screenName, tweetID) => {
  return `https://twitter.com/${screenName}/status/${tweetID}`
}

export const createDeconstructedDate = (date) => {
  return ({
    day: date.getDate(),
    month: date.getMonth(),
    year: date.getFullYear()
  })
}

export const createMentionLink = (screenName) => {
  return `@<a class="tweet-url username" href="https://twitter.com/${screenName}" data-screen-name="${screenName}" rel="nofollow">${screenName}</a>`
}

export const createGenericLink = (url) => {
  return `<a href="${url}" rel="nofollow">${url}</a>`;
}

export const createFormattedMediaObj = (media) => {
  return ({
    twitter_media_id: media.id_str,
    type: media.type,
    image_url: media?.media_url_https,
    video_url: media?.video_info?.variants[0].url
  })
}

export const getUrls = (text) => {
  return twitter.extractUrls(text)
}

export const getMentions = (text) => {
  return twitter.extractMentions(text);
}

export const getHashtags = (text) => {
  return twitter.extractHashtags(text);
}