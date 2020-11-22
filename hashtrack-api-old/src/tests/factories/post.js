import faker from 'faker';
import { Chance } from 'chance';
import { Factory } from 'rosie';

export const media_types = {
  GIF: 'animated_gif',
  PHOTO: 'photo',
  VIDEO: 'video',
}

// A factory for a formatted post
export default () => {
  return new Factory()
    .sequence('twitter_post_id', (id) => {
      return id.toString();
    })
    .attr('created_at', new Date())
    .attr('deconstructed_date', ['created_at'], (created_at) => {
      return {
        day: created_at.getDate(),
        month: created_at.getMonth(),
        year: created_at.getFullYear(),
      }
    })
    .attr('text', faker.lorem.sentence())
    .attr('source', faker.internet.url())
    .option('hashtag_length', 10)
    .attr('hashtags', ['hashtag_length'], (hashtag_length) => {
      return [...Array(hashtag_length)].map(() => new Chance().hashtag());
    })
    .option('text_with_url', false)
    .option('media_type', media_types.PHOTO)
    .attr('media', ['media_type'], media_type => {
      const media = [];
      switch (media_type) {
        case media_types.ANIMATED_GIF:
          media.push({
            image_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
            video_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
            type: media_types.ANIMATED_GIF
          })
        case media_types.VIDEO:
          media.push({
            image_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/200_s.gif",
            video_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/giphy.mp4",
            type: media_types.VIDEO
          });
          break;
        case media_types.PHOTO:
          media.push({
            image_url: faker.image.imageUrl(),
            video_url: null,
            type: media_types.PHOTO
          }, {
            image_url: faker.image.imageUrl(),
            video_url: null,
            type: media_types.PHOTO
          }, {
            image_url: faker.image.imageUrl(),
            video_url: null,
            type: media_types.PHOTO
          }, {
            image_url: faker.image.imageUrl(),
            video_url: null,
            type: media_types.PHOTO
          });
          break;
      }
      return media;
    })
    .after((post, options) => {
      if (options.text_with_url) {
        post.text.concat(' ', faker.internet.imageUrl())
      }
    })
};
