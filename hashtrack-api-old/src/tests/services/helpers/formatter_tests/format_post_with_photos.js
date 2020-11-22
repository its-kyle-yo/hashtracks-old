import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";
import { TWEET_TYPES } from "@factories/twitter/tweet";
import {
  createGenericLink,
  createMentionLink,
  createFormattedMediaObj,
  createSourceLink,
  createHashtagLink,
  createDeconstructedDate,
} from "@tests/test_helpers"

export default describe('A Tweet With 4 Photos', () => {
  const tweetWithPhotos = TweetFactory.build({}, { tweet_type: TWEET_TYPES.PHOTO });
  const formattedPost = formatPost(tweetWithPhotos);
  describe('formatted post object', () => {
    const { twitter_post_id } = formattedPost;
    it('should have the same ID as the original object', () => {
      expect(twitter_post_id).toEqual(tweetWithPhotos.id_str);
    })

    it('should have the same created_at time as the original object', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithPhotos.created_at);
    });

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithPhotos.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithPhotos.user.screen_name, tweetWithPhotos.id));
    });

    describe('media', () => {
      const { media } = formattedPost;
      it('should have the same length as the original object', () => {
        expect(media.length).toEqual(tweetWithPhotos.entities.media.length);
      });

      it('should be an array of media objects', () => {
        expect(Array.isArray(media)).toBe(true)
      })

      it('should contain objects derived from the original objects media entities', () => {
        tweetWithPhotos.entities.media.forEach(mediaObj => {
          expect(
            media.find((media) => media.twitter_media_id === mediaObj.id_str)
          ).toEqual(createFormattedMediaObj(mediaObj));
        })
      })
    })

    describe('hashtags', () => {
      const { hashtags } = formattedPost;
      it('should be an array', () => {
        expect(Array.isArray(hashtags)).toBe(true)
      });

      it('should all be strings', () => {
        hashtags.forEach(hashtag => {
          expect(typeof hashtag).toBe('string')
        })
      })

      it('should be derived from the original objects hashtags entities', () => {
        tweetWithPhotos.entities.hashtags.forEach(hashtag => {
          expect(hashtags).toContain(hashtag.text);
        });
      })

      it('should have the same length as the original object', () => {
        expect(hashtags.length).toEqual(tweetWithPhotos.entities.hashtags.length);
      });
    })

    describe('text', () => {
      const { text } = formattedPost;
      it('should contain links to hashtags', () => {
        tweetWithPhotos.entities.hashtags.forEach(hashtag => {
          expect(text).toContain(createHashtagLink(hashtag.text));
        })
      });

      it('should contain links to all media urls', () => {
        tweetWithPhotos.entities.media.forEach(mediaObj => {
          expect(text).toContain(createGenericLink(mediaObj.media_url))
        })
      });

      it('should contain links to all user mentions', () => {
        tweetWithPhotos.entities.user_mentions.forEach(mention => {
          expect(text).toContain(createMentionLink(mention.screen_name));
        });
      });

      it('should contain all links to included non-media urls', () => {
        tweetWithPhotos.entities.urls.forEach(({ url }) => {
          expect(text).toContain(createGenericLink(url));
        });
      });
    });
  });
});