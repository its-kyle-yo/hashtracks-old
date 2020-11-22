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
import { media_types } from "@factories/post";

export default describe('A Tweet With a Video', () => {
  const tweetWithVideo = TweetFactory.build({}, { tweet_type: TWEET_TYPES.VIDEO });
  const formattedPost = formatPost(tweetWithVideo);

  describe('formatted post object', () => {
    it('should have the same ID as the original object', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(tweetWithVideo.id_str);
    })

    it('should have the same created_at time as the original object', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithVideo.created_at);
    });

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithVideo.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithVideo.user.screen_name, tweetWithVideo.id));
    });

    describe('media', () => {
      const { media } = formattedPost;

      it('should only have one media object', () => {
        expect(media.length).toBe(1)
        expect(tweetWithVideo.entities.media.length).toBe(1)
        expect(tweetWithVideo.extended_entities.media.length).toBe(1)
      })

      it(`with a type of ${media_types.VIDEO}`, () => {
        const [mediaObj] = media
        const [originalMediaObj] = tweetWithVideo.entities.media;
        const [extendedMediaObj] = tweetWithVideo.extended_entities.media;
        expect(mediaObj.type).toBe(media_types.VIDEO)
        // regular entities media type will always be type photo
        expect(originalMediaObj.type).toBe(media_types.PHOTO)
        expect(extendedMediaObj.type).toBe(media_types.VIDEO)
      })

      it('should have the same length as the original object', () => {
        expect(media.length).toEqual(tweetWithVideo.entities.media.length);
      });

      it('should be an array of media objects', () => {
        expect(Array.isArray(media)).toBe(true)
      })

      it('should contain objects derived from the original objects media extended_entities', () => {
        tweetWithVideo.entities.media.forEach(mediaObj => {
          expect(
            media.find((media) => media.twitter_media_id === mediaObj.id_str)
          ).not.toEqual(createFormattedMediaObj(mediaObj));

          expect(
            media.find((media) => media.twitter_media_id === mediaObj.id_str).type
          ).not.toBe(mediaObj.type)
        })

        tweetWithVideo.extended_entities.media.forEach(extendedMediaObj => {
          expect(
            media.find((media) => media.twitter_media_id === extendedMediaObj.id_str)
          ).toEqual(createFormattedMediaObj(extendedMediaObj));

          expect(
            media.find((media) => media.twitter_media_id === extendedMediaObj.id_str).type
          ).toBe(extendedMediaObj.type)
        })
      })

      describe('video_url', () => {
        it('should exist', () => {
          media.forEach(mediaObj => expect(mediaObj.video_url).toBeTruthy())
        })

        it('should be derived from the original objects video_info', () => {
          tweetWithVideo.extended_entities.media.forEach(extendedMediaObj => {
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
        expect(hashtags.length).toEqual(tweetWithVideo.entities.hashtags.length);
      });

      it('should be derived from the original objects hashtags entities', () => {
        tweetWithVideo.entities.hashtags.forEach(hashtag => {
          expect(hashtags).toContain(hashtag.text);
        });
      })
    })

    describe('text', () => {
      const { text } = formattedPost;

      it('should contain links to hashtags', () => {
        tweetWithVideo.entities.hashtags.forEach(hashtag => {
          expect(text).toContain(createHashtagLink(hashtag.text));
        })
      });

      it('should contain links to all media urls', () => {
        tweetWithVideo.entities.media.forEach(mediaObj => {
          expect(text).toContain(createGenericLink(mediaObj.media_url))
        })
      });

      it('should contain links to all user mentions', () => {
        tweetWithVideo.entities.user_mentions.forEach(mention => {
          expect(text).toContain(createMentionLink(mention.screen_name));
        });
      });

      it('should contain all links to included non-media urls', () => {
        tweetWithVideo.entities.urls.forEach(({ url }) => {
          expect(text).toContain(createGenericLink(url));
        });
      });
    });
  });
});