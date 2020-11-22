import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";
import { makeUrlString, makeMediaUrlString } from "@factories/twitter/tweet";
import { media_types } from "@factories/post";
import {
  createSourceLink,
  createDeconstructedDate,
  getUrls
} from "@tests/test_helpers"
import { getMentions, getHashtags } from "../../../test_helpers";


export default describe('Tweet With Just URLs', () => {
  const testOptions = {
    numUrls: 10,
    urlLength: 2,
  }
  const tweetWithJustURLs = TweetFactory.build({ text: makeUrlString(testOptions.numUrls, testOptions.urlLength) });
  const formattedPost = formatPost(tweetWithJustURLs);

  describe('formatted post object', () => {
    it('should have the same ID as the original tweet', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(tweetWithJustURLs.id_str);
    });

    it('should have the same created_at value as the original tweet', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithJustURLs.created_at);
    });

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithJustURLs.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithJustURLs.user.screen_name, tweetWithJustURLs.id));
    });

    describe('text', () => {
      const { text } = formattedPost;
      it('should contain links', () => {
        // Num URLS is doubled here because of the auto-linking applying the same URL as the href of the anchor
        expect(getUrls(text).length).toBe(testOptions.numUrls * 2);
      });

      describe('links', () => {
        it('should be match the tweets entities urls', () => {
          tweetWithJustURLs.entities.urls.forEach(({ url }) => {
            expect(text).toContain(url);
          });
        });
      });

      it('should not have any mentions', () => {
        expect(text).not.toContain('@');
        expect(getMentions(tweetWithJustURLs.text).length).toEqual(0);
        expect(tweetWithJustURLs.entities.user_mentions.length).toBe(0);
      });

      it('should not have any hashtags', () => {
        expect(text).not.toContain('#');
        expect(getHashtags(tweetWithJustURLs.text).length).toEqual(0);
        expect(tweetWithJustURLs.entities.hashtags.length).toBe(0);
      });

      it('should not be derived from an extended tweets text', () => {
        expect(tweetWithJustURLs.extended_tweet).not.toBeDefined();
      });
    });

    describe('media', () => {
      const { media } = formattedPost;
      it('should be empty', () => {
        expect(media.length).toBe(0);
      });
    });

    describe('hashtags', () => {
      const { hashtags } = formattedPost
      it('should be empty', () => {
        expect(hashtags.length).toBe(0);
      });
    });
  });

  describe('Tweet With Just Media URLs', () => {
    const testOptions = {
      numUrls: 2,
      type: media_types.PHOTO
    };

    const tweetWithJustMediaURLs = TweetFactory.build({ text: makeMediaUrlString(testOptions.numUrls, testOptions.type) }, { media_urls: "" });
    const formattedPost = formatPost(tweetWithJustMediaURLs);

    it('should have the same ID as the original tweet', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(tweetWithJustMediaURLs.id_str);
    })

    it('should have the same created_at value as the original tweet', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithJustMediaURLs.created_at);
    })

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithJustMediaURLs.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithJustMediaURLs.user.screen_name, tweetWithJustMediaURLs.id));
    });

    describe('text', () => {
      const { text } = formattedPost;

      it('should contain links', () => {
        // Num URLS is doubled here because of the auto-linking applying the same URL as the href of the anchor
        expect(getUrls(text).length).toBe(testOptions.numUrls * 2);
      });

      describe('links', () => {
        it('should be match the tweets entities urls', () => {
          tweetWithJustMediaURLs.entities.urls.forEach(({ url }) => {
            expect(text).toContain(url);
          })
        });
      });

      it('should not have any mentions', () => {
        expect(text).not.toContain('@');
        expect(getMentions(tweetWithJustMediaURLs.text).length).toEqual(0);
        expect(tweetWithJustMediaURLs.entities.user_mentions.length).toBe(0);
      });

      it('should not have any hashtags', () => {
        expect(text).not.toContain('#');
        expect(getMentions(tweetWithJustMediaURLs.text).length).toEqual(0);
        expect(tweetWithJustMediaURLs.entities.hashtags.length).toBe(0);
      });

      it('should not be derived from an extended tweets text', () => {
        expect(tweetWithJustMediaURLs.extended_tweet).not.toBeDefined();
      });
    });

    describe('media', () => {
      const { media } = formattedPost;
      it('should be empty', () => {
        // Media URLs in a tweets text will not be considered a native element and
        // will not show an image with a link 
        expect(media.length).toBe(0);
      });
    });

    describe('hashtags', () => {
      const { hashtags } = formattedPost
      it('should be empty', () => {
        expect(hashtags.length).toBe(0);
      });
    });
  })
});