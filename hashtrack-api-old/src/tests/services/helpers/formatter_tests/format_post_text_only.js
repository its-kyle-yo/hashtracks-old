import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";
import { TWEET_TYPES } from "@factories/twitter/tweet";


import {
  createSourceLink,
  createDeconstructedDate,
  getUrls
} from "@tests/test_helpers"
import { getMentions, getHashtags } from "../../../test_helpers";

export default describe('A Tweet With Only Texts', () => {
  const tweetWithTextOnly = TweetFactory.build({}, { tweet_type: TWEET_TYPES.TEXT_ONLY });
  const formattedPost = formatPost(tweetWithTextOnly);

  describe('formatted post object', () => {
    it('should have the same ID as the original tweet', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(tweetWithTextOnly.id_str);
    })

    it('should have the same created_at value as the original tweet', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithTextOnly.created_at);
    })

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithTextOnly.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithTextOnly.user.screen_name, tweetWithTextOnly.id));
    });

    describe('text', () => {
      const { text } = formattedPost;

      it('should have a length of 140 characters', () => {
        expect(text.length).toBe(140);
      });

      it('should not contain any links', () => {
        expect(getUrls(text).length).toBe(0);
      });

      it('should not have any mentions', () => {
        expect(text).not.toContain('@');
        expect(getMentions(tweetWithTextOnly.text).length).toEqual(0);
        expect(tweetWithTextOnly.entities.user_mentions.length).toBe(0);
      });

      it('should not have any hashtags', () => {
        expect(text).not.toContain('#');
        expect(getHashtags(tweetWithTextOnly.text).length).toEqual(0);
        expect(tweetWithTextOnly.entities.hashtags.length).toBe(0);
      });

      it('should not be derived from an extended tweets text', () => {
        expect(text).toEqual(tweetWithTextOnly.text);
        expect(tweetWithTextOnly.extended_tweet).not.toBeDefined();
      });
    })

    describe('media', () => {
      const { media } = formattedPost;

      it('should be empty', () => {
        expect(media.length).toBe(0);
      })
    })

    describe('hashtags', () => {
      const { hashtags } = formattedPost

      it('should be empty', () => {
        expect(hashtags.length).toBe(0);
      })
    })
  })
})