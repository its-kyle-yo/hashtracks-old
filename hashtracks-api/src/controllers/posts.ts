// Modules
import status from 'http-status-codes'

// Services
import { PostsService } from '@services'

// Helpers
import { CUSTOM_ERRORS } from '@helpers'

// Types
import { Request, Response, NextFunction } from 'express-serve-static-core'
import { TweetObject } from 'twitter'
import { PostsControllerReturn, ReturnedPosts } from 'CustomTypes'

export class PostsController {
  /**
  * Responds to a Twitter subscription event for users creation of a
  * tweet on Twitter
  * @param event
  * @param res
  */
  async createPostFromWebhook(tweetEvents: TweetObject[], forUserID: string): Promise<ReturnedPosts> {
    const createdPosts = await PostsService.create(tweetEvents, forUserID)
    return createdPosts
  }

  /**
   * Routes to PostsService.create
   * @param req
   * @param res
   * @param handleError
   */
  async createPost(req: Request, res: Response, handleError: NextFunction): PostsControllerReturn {
    try {
      const { twitterUserID, post } = req.body
      if (!!post && !!twitterUserID) {
        const createdPost = await PostsService.create([post], twitterUserID)
        return res.status(status.CREATED).json(createdPost)
      }
      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Routes to PostsService.findOne
   * @param req
   * @param res
   * @param handleError
   */
  async findOne(req: Request, res: Response, handleError: NextFunction): PostsControllerReturn {
    try {
      const { id } = req.params
      if (id) {
        const foundPost = await PostsService.findOne(`twitterPostID`, id)
        return res.status(status.OK).json(foundPost)
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Routes to PostsService.update
   * @param req
   * @param res
   * @param handleError
   */
  async update(req: Request, res: Response, handleError: NextFunction): PostsControllerReturn {
    try {
      const { id } = req.params
      const { data } = req.body

      if (!!data && !!id) {
        const updatedPost = await PostsService.update(id, data)
        return res.status(status.OK).json(updatedPost)
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * Routes to PostsService.deleteOne
   * @param req
   * @param res
   * @param handleError
   */
  async deleteOne(req: Request, res: Response, handleError: NextFunction) {
    try {
      const { id } = req.params
      if (id) {
        const deletedCount = await PostsService.deleteOne(id)
        return res.status(status.OK).json({ id, deleted: deletedCount })
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }
}

export default new PostsController()
