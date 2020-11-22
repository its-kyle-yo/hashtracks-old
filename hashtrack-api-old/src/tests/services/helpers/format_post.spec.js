import { formatPost } from "@services/helpers";
import { TweetFactory } from "@factories";

describe('Format Post', () => {

  it('should reject a retweet', () => {
    const retweetedTweet = TweetFactory.build({ retweeted_status: TweetFactory.build() });
    const formattedPost = formatPost(retweetedTweet);

    expect(formattedPost).toBe(false);
  })

  it('should reject a quote tweet', () => {
    const quoteTweet = TweetFactory.build({}, { quote_tweet: true });
    const formattedPost = formatPost(quoteTweet);

    expect(formattedPost).toBe(false);
  })

  require('./formatter_tests/format_post_hashtags_only');
  require('./formatter_tests/format_post_mentions_only');
  require('./formatter_tests/format_post_reply_tweet');
  require('./formatter_tests/format_post_text_only');
  require('./formatter_tests/format_post_urls_only');
  require('./formatter_tests/format_post_with_gif');
  require('./formatter_tests/format_post_with_photos');
  require('./formatter_tests/format_post_with_video');
});
