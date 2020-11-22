import util from 'util';
import twitter from "twitter-text";

export const formatPost = (post) => {
  const isUsersTweet = isOwnTweet(post)
  if (isUsersTweet) {
    const date = new Date(post?.created_at)
    let formattedPost = {
      twitter_post_id: post.id_str,
      created_at: date,
      deconstructed_date: {
        day: date.getDate(),
        month: date.getMonth(),
        year: date.getFullYear()
      },
      text: post.text || '',
      source: `https://twitter.com/${post.user.screen_name}/status/${post.id_str}`,
      hashtags: twitter.extractHashtags(post.text),
      media: [],
    }

    const formatMedia = media => {
      return ({
        twitter_media_id: media?.id_str,
        type: media?.type,
        image_url: media?.media_url_https,
        video_url: media?.video_info?.variants[0].url
      })
    }

    // If the property extended_tweet exists on the object we ALWAYS 
    // want to use it as the source of truth for media and text
    if (post.hasOwnProperty('extended_tweet')) {
      const { entities, extended_entities, full_text } = post.extended_tweet;
      formattedPost.text = full_text;
      formattedPost.hashtags = twitter.extractHashtags(full_text);

      if (extended_entities?.length) {
        const formattedMedia = extended_entities.media?.map(formatMedia);
        formattedPost.media = [...formattedPost.media, ...formattedMedia];
      }

      if (entities?.media?.length) {
        const formattedMedia = entities.media.map(formatMedia);
        formattedPost.media = [...formattedPost.media, ...formattedMedia];
      }
    } else {
      if (post?.extended_entities?.media?.length) {
        const formattedMedia = post.extended_entities.media.map(formatMedia);
        formattedPost.media = [...formattedPost.media, ...formattedMedia];
      } else if (post?.entities?.media?.length) {
        const formattedMedia = post.entities.media.map(formatMedia);
        formattedPost.media = [...formattedPost.media, ...formattedMedia];
      }
    }


    formattedPost.text = twitter.autoLink(formattedPost.text);
    formattedPost.media = filterDuplicates(formattedPost.media, 'twitter_media_id')
    return formattedPost
  }

  return isUsersTweet;
}

const isOwnTweet = (post) => {
  return (!post.is_quote_status && !post.retweeted_status)
}

const filterDuplicates = (arr, id_name) => {
  return arr.reduce((acc, current) => {
    const x = acc.find(item => item[id_name] === current[id_name]);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, []);
}

export const renameProperty = (obj, old_key, new_key) => {
  if (old_key !== new_key) {
    Object.defineProperty(obj, new_key,
      Object.getOwnPropertyDescriptor(obj, old_key));
    delete obj[old_key];
  }
}

export const deepLogObject = (obj) => {
  console.log(util.inspect(obj, false, null, true /* enable colors */))
}