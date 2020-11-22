import User from './user';
import Post from './post';
import Webhook from './webhook';
import Tweet from './twitter/tweet';

const UserFactory = User();
const PostFactory = Post();
const WebhookFactory = Webhook();
const TweetFactory = Tweet();

module.exports = { UserFactory, PostFactory, WebhookFactory, TweetFactory }