import status from 'http-status-codes';
import { WebhookService } from "@services/Webhook";
import { PostService } from '@services/Post'
import { UserService } from "@services/User";

const TWITTER_EVENTS = {
  CREATE: 'tweet_create_events',
  DELETE: 'tweet_delete_events',
  USER_REMOVED: 'user_event',
}

export const respondWithCrc = (req, res) => {
  const token = req?.query.crc_token;
  if (token) {
    const response_token = WebhookService.generateCRC(token);
    return res.status(status.OK).json({ response_token });
  }

  return res.status(status.BAD_REQUEST).send('Bad Request')
}

export const createPost = async (event, res) => {
  console.warn('Twitter Event Create')
  const { for_user_id, [TWITTER_EVENTS.CREATE]: posts } = event;
  const createdPosts = await PostService.create({ posts, authorID: for_user_id });

  return res.status(status.CREATED).json(createdPosts)
}

export const deletePost = async (event, res) => {
  const deletedPosts = await PostService.deleteMany(event);
  return res.status(status.OK).json(deletedPosts);
}

export const deleteUser = async (event, res) => {
  const { user_event } = event
  if (user_event?.revoke?.source?.user_id) {
    const removedUser = await UserService.deleteByTwitterID(user_event.revoke.source.user_id)
    return res.status(status.OK).json(removedUser);
  }
}

export const handleTwitterEvents = async (req, res) => {
  try {
    const { body: event, subscriptionEventType } = req;
    if (subscriptionEventType === TWITTER_EVENTS.USER_REMOVED) {
      return await deleteUser(event, res);
    }

    if (event.for_user_id) {
      if (event[subscriptionEventType].length) {
        if (subscriptionEventType === TWITTER_EVENTS.CREATE) {
          return await createPost(event, res);
        }

        if (subscriptionEventType === TWITTER_EVENTS.DELETE) {
          return await deletePost(event, res);
        }
        throw new Error('No Events Specified/Available')
      } else {
        throw new Error('User Event Is Empty')
      }
    }
  } catch (err) {
    return res.status(status.BAD_REQUEST).send(err.message.toString());
  }
}