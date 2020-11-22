import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";

import {
  createMentionLink,
  createSourceLink,
  createDeconstructedDate,
} from "@tests/test_helpers"
import { getMentions, getHashtags } from "../../../test_helpers";
import { makeTypeString } from "../../../factories/twitter/tweet";


export default describe('A Tweet With Just Mentions', () => {
  const testOptions = {
    numberOfMentions: 35, // Max amount of characters without going over 140 Characters
    type: 'twitter'
  };

  const tweetWithJustMentions = TweetFactory.build({ text: makeTypeString(testOptions.type, testOptions.numberOfMentions) }, { media_urls: "" });
  const formattedPost = formatPost(tweetWithJustMentions);
  describe('formatted post object', () => {
    it('should have the same ID as the original tweet', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(tweetWithJustMentions.id_str);
    })

    it('should have the same created_at value as the original tweet', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithJustMentions.created_at);
    })

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithJustMentions.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithJustMentions.user.screen_name, tweetWithJustMentions.id));
    });

    describe('text', () => {
      const { text } = formattedPost;

      it('should contain links to the mentioned users', () => {
        tweetWithJustMentions.entities.user_mentions.forEach(mention => {
          expect(text).toContain(createMentionLink(mention.screen_name));
        })
      });

      describe('links', () => {
        it('should be match the tweets entities urls', () => {
          tweetWithJustMentions.entities.urls.forEach(({ url }) => {
            expect(text).toContain(url);
          })
        });
      });

      it('should have mentions', () => {
        tweetWithJustMentions.entities.user_mentions.forEach(mention => {
          expect(text).toContain(createMentionLink(mention.screen_name));
        })
        expect(getMentions(tweetWithJustMentions.text).length).toEqual(testOptions.numberOfMentions);
        expect(tweetWithJustMentions.entities.user_mentions.length).toBe(testOptions.numberOfMentions);
      });

      it('should not have any hashtags', () => {
        expect(text).not.toContain('#');
        expect(getHashtags(tweetWithJustMentions.text).length).toEqual(0);
        expect(tweetWithJustMentions.entities.hashtags.length).toBe(0);
      });

      it('should not be derived from an extended tweets text', () => {
        expect(tweetWithJustMentions.extended_tweet).not.toBeDefined();
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