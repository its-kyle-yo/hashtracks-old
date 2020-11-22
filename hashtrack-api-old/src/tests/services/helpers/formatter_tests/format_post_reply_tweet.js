import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";
import {
  createGenericLink,
  createMentionLink,
  createSourceLink,
  createHashtagLink,
  createDeconstructedDate,
  createFormattedMediaObj
} from "@tests/test_helpers";
import { media_types } from "@factories/post";

describe('A Reply Tweets', () => {
  const replyTweet = TweetFactory.build({}, { is_reply: true });
  const formattedPost = formatPost(replyTweet);

  describe('formatted post object', () => {
    it('should have the same ID as the original object', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(replyTweet.id_str);
    })

    it('should have the same created_at time as the original object', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(replyTweet.created_at);
    });

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(replyTweet.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(replyTweet.user.screen_name, replyTweet.id));
    });

    describe('media', () => {
      const { media } = formattedPost;

      describe('should only have one media object', () => {
        expect(media.length).toBe(1)
        expect(replyTweet.entities.media.length).toBe(1)
        expect(replyTweet.extended_entities.media.length).toBe(1)
      });

      it(`with a type of ${media_types.GIF}`, () => {
        const [mediaObj] = media
        const [originalMediaObj] = replyTweet.entities.media;
        const [extendedMediaObj] = replyTweet.extended_entities.media;
        expect(mediaObj.type).toBe(media_types.GIF)
        // regular entities media type will always be type photo
        expect(originalMediaObj.type).toBe(media_types.PHOTO)
        expect(extendedMediaObj.type).toBe(media_types.GIF)
      });

      it('should have the same length as the original object', () => {
        expect(media.length).toEqual(replyTweet.entities.media.length);
      });

      it('should be an array of media objects', () => {
        expect(Array.isArray(media)).toBe(true)
      })

      it('should contain objects derived from the original objects media extended_entities', () => {
        replyTweet.entities.media.forEach(mediaObj => {
          expect(
            media.find((media) => media.twitter_media_id === mediaObj.id_str)
          ).not.toEqual(createFormattedMediaObj(mediaObj));

          expect(
            media.find((media) => media.twitter_media_id === mediaObj.id_str).type
          ).not.toBe(mediaObj.type)
        })

        replyTweet.extended_entities.media.forEach(extendedMediaObj => {
          expect(
            media.find((media) => media.twitter_media_id === extendedMediaObj.id_str)
          ).toEqual(createFormattedMediaObj(extendedMediaObj));

          expect(
            media.find((media) => media.twitter_media_id === extendedMediaObj.id_str).type
          ).toBe(extendedMediaObj.type)
        })
      })

      describe('video_url', () => {
        it('should not be undefined', () => {
          media.forEach(mediaObj => expect(mediaObj.video_url).toBeTruthy())
        })

        it('should be derived from the original objects video_info', () => {
          replyTweet.extended_entities.media.forEach(extendedMediaObj => {
            expect(
              media.find((media) => media.twitter_media_id === extendedMediaObj.id_str).video_url
            ).toEqual(extendedMediaObj.video_info.variants[0].url)
          })
        });
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

      it('should have the same length as the original object', () => {
        expect(hashtags.length).toEqual(replyTweet.entities.hashtags.length);
      });

      it('should be derived from the original objects hashtags entities', () => {
        replyTweet.entities.hashtags.forEach(hashtag => {
          expect(hashtags).toContain(hashtag.text);
        });
      })
    })

    describe('text', () => {
      const { text } = formattedPost;

      it('should contain links to hashtags', () => {
        replyTweet.entities.hashtags.forEach(hashtag => {
          expect(text).toContain(createHashtagLink(hashtag.text));
        })
      });

      it('should contain links to all media urls', () => {
        replyTweet.entities.media.forEach(mediaObj => {
          expect(text).toContain(createGenericLink(mediaObj.media_url))
        })
      });

      it('should contain links to all user mentions', () => {
        replyTweet.entities.user_mentions.forEach(mention => {
          expect(text).toContain(createMentionLink(mention.screen_name));
        });
      });

      it('should contain all links to included non-media urls', () => {
        replyTweet.entities.urls.forEach(({ url }) => {
          expect(text).toContain(createGenericLink(url));
        });
      });
    });
  })
})