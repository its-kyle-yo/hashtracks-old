import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";

import {
  createMentionLink,
  createSourceLink,
  createHashtagLink,
  createDeconstructedDate,
} from "@tests/test_helpers";
import { getMentions, getHashtags } from "../../../test_helpers";
import { makeTypeString } from "../../../factories/twitter/tweet";


export default describe('A Tweet With Just Hashtags', () => {
  const testOptions = {
    numberOfHashtags: 35, // Max amount of characters without going over 140 Characters
    type: 'hashtag'
  };

  const tweetWithJustHashtags = TweetFactory.build({ text: makeTypeString(testOptions.type, testOptions.numberOfHashtags) }, { media_urls: "" });
  const formattedPost = formatPost(tweetWithJustHashtags);
  describe('formatted post object', () => {
    it('should have the same ID as the original tweet', () => {
      const { twitter_post_id } = formattedPost;
      expect(twitter_post_id).toEqual(tweetWithJustHashtags.id_str);
    })

    it('should have the same created_at value as the original tweet', () => {
      const { created_at } = formattedPost;
      expect(created_at).toEqual(tweetWithJustHashtags.created_at);
    })

    it('should have a deconstructed date based on the original objects created_at value', () => {
      const { deconstructed_date } = formattedPost;
      expect(deconstructed_date).toEqual(createDeconstructedDate(tweetWithJustHashtags.created_at));
    });

    it('should have a source derived from the users screen_name', () => {
      const { source } = formattedPost;
      expect(source).toEqual(createSourceLink(tweetWithJustHashtags.user.screen_name, tweetWithJustHashtags.id));
    });

    describe('text', () => {
      const { text } = formattedPost;

      it('should contain links to the mentioned users', () => {
        tweetWithJustHashtags.entities.user_mentions.forEach(mention => {
          expect(text).toContain(createMentionLink(mention.screen_name));
        })
      });

      describe('links', () => {
        it('should be match the tweets entities urls', () => {
          tweetWithJustHashtags.entities.urls.forEach(({ url }) => {
            expect(text).toContain(url);
          })
        });
      });

      it('should have hashtags', () => {
        tweetWithJustHashtags.entities.hashtags.forEach(mention => {
          expect(text).toContain(createHashtagLink(mention.text));
        })
        expect(getHashtags(tweetWithJustHashtags.text).length).toEqual(testOptions.numberOfHashtags);
        expect(tweetWithJustHashtags.entities.hashtags.length).toBe(testOptions.numberOfHashtags);
      });

      it('should not have any mentions', () => {
        expect(text).not.toContain('@');
        expect(getMentions(tweetWithJustHashtags.text).length).toEqual(0);
        expect(tweetWithJustHashtags.entities.user_mentions.length).toBe(0);
      });

      it('should not be derived from an extended tweets text', () => {
        expect(tweetWithJustHashtags.extended_tweet).not.toBeDefined();
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
      it('should not be empty', () => {
        expect(hashtags.length).toBe(testOptions.numberOfHashtags);
      });
    });
  });
});