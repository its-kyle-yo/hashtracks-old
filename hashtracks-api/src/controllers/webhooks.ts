// Modules
import status from 'http-status-codes'

// Services
import { WebhooksService, UsersService, PostsService } from '@services'

// Controllers
import { PostsController } from '@controllers'

// Helpers
import { CUSTOM_ERRORS } from '@helpers'

// Types
import { Post, User } from '@prisma/client'
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { TwitterCreateEvent, TwitterDeleteEvent, UserRevokeEvent } from 'twitter'

declare global {
  namespace Express {
    interface Request {
      subscriptionEventType: string
    }
  }
}

/**
 * A list of currently supported twitter subscription events
 * For more event types and their payload structure see:
 * {https://developer.twitter.com/en/docs/accounts-and-users/subscribe-account-activity/guides/account-activity-data-objects}
 */
export const TWITTER_EVENTS = {
  CREATE: `tweet_create_events`,
  DELETE: `tweet_delete_events`,
  USER_REMOVED: `user_event`,
}

/**
 * The WebhooksController manages all incoming Twitter subscription events
 */
export class WebhooksController {
  /**
   * Responds to a CRC Request with a generated token from twitter
   * @param req
   * @param res
   */
  async respondWithCrc(req: Request, res: Response, handleError: NextFunction): Promise<Response<string> | void> {
    try {
      const token = req?.query.crc_token
      if (token) {
        const response_token = await WebhooksService.generateCRC(token)
        return res.status(status.OK).json({ response_token })
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (err?.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Responds to a Twitter subscription event for users creation of a
   * tweet on Twitter
   * @param event
   * @param res
   */
  async createPost(event: TwitterCreateEvent, res: Response, handleError: NextFunction): Promise<Response<Post[]> | void> {
    try {
      const { for_user_id, [TWITTER_EVENTS.CREATE]: tweetEvents } = event
      const createdPosts = await PostsController.createPostFromWebhook(tweetEvents, for_user_id)
      return res.status(status.CREATED).json(createdPosts)
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Responds to a request from Twitter when a user deletes a post on the platform
   * @param event
   * @param res
   */
  async deletePost(event: TwitterDeleteEvent, res: Response, handleError: NextFunction): Promise<Response<Post[]> | void> {
    try {
      const { [TWITTER_EVENTS.DELETE]: tweetDeleteEvents } = event
      const deletedPosts = await PostsService.deleteMany(tweetDeleteEvents)
      return res.status(status.OK).json(deletedPosts)
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Responds to a request from Twitter when a user revokes the applications access
   * to their account
   * @param event
   * @param res
   */
  async deleteUser(event: UserRevokeEvent, res: Response, handleError: NextFunction): Promise<Response<User> | void> {
    try {
      const { user_event } = event
      if (user_event?.revoke?.source?.user_id) {
        const removedUser = await UsersService.delete(user_event.revoke.source.user_id)
        return res.status(status.OK).json(removedUser)
      }
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Routes incoming Twitter Webhook subscription requests to their correct methods
   * @param req
   * @param res
   */
  handleTwitterEvents = async (req: Request, res: Response, handleError: NextFunction) => {
    try {
      const { body: event, subscriptionEventType } = req
      if (subscriptionEventType === TWITTER_EVENTS.USER_REMOVED) {
        return await this.deleteUser(event, res, handleError)
      }

      if (event.for_user_id && event[subscriptionEventType].length) {
        if (subscriptionEventType === TWITTER_EVENTS.CREATE) {
          return await this.createPost(event, res, handleError)
        }

        if (subscriptionEventType === TWITTER_EVENTS.DELETE) {
          return await this.deletePost(event, res, handleError)
        }
        throw CUSTOM_ERRORS.BAD_REQUEST
      }
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }
}

export default new WebhooksController()
