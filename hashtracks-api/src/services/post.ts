// Bridges & Services
import { PostsBridge } from '@bridges'
import { UsersService } from '@services'

// Helpers
import { formatTweet, deepLogObject } from '@helpers'

// Types
import { Post, PostUpdateInput } from '@prisma/client'
import { TweetObject, TwitterDeleteEvent } from 'twitter'
import { ReturnedPosts, DeletedPostsInfo, PostWithParsedDate } from 'CustomTypes'

/**
 * The Posts Service handles all interactions between the Posts Bridge and Routes
 * Currently it does all of its CRUD actions based on the Twitter Webhook Subscriptions
 * but will be adjusted in the future to allow users to manage their content from
 * the frontend
 */
export class PostsService {
  /**
   * Formats a post and saves it to the database
   * @param tweetEvents
   * @param for_user_id
   */
  async create(tweetEvents: TweetObject[], for_user_id: string): Promise<ReturnedPosts> {
    // 1. Check if a user exists
    const userExists = await UsersService.exists(for_user_id)
    if (userExists) {
      // 2. Loop through all events and format them
      const promises = tweetEvents.map(async (tweetEvent) => {
        const formattedPost = formatTweet(tweetEvent)
        if (formattedPost) {
          // 3. Set each saved post as a promise
          const post = await PostsBridge.create({ formattedPost, for_user_id })
          return this.formatForReturn(post)
        }
      })

      // 4. Resolve each promise into its formatted post
      const posts = await Promise.all(promises)
      deepLogObject(posts, `Created Posts`)
      // 5. Return array of posts
      return { posts }
    }
    // If no user return an empty array
    return { posts: [] }
  }

  /**
   * Finds every post for a given user
   * @param twitterUserID
   */
  async findAll(twitterUserID: string): Promise<ReturnedPosts> {
    // 1. Check if a user exists
    const userExists = await UsersService.exists(twitterUserID)
    if (userExists) {
      // 2. Get all posts
      const foundPosts = await PostsBridge.findAll(twitterUserID)
      const formattedPosts = foundPosts.map((post) => this.formatForReturn(post))
      return { posts: formattedPosts }
    }

    // If no user return an empty array
    return { posts: [] }
  }

  /**
   * Finds a single post based on given filter and criteria
   * @param filter - A key that exists on a post object in the database or schema
   * @param value - An value for any filter information
   */
  async findOne(filter: string, value: any): Promise<ReturnedPosts> {
    const foundPost = await PostsBridge.findOne({ filter, value })
    if (foundPost) {
      const formattedPost = this.formatForReturn(foundPost)
      return { post: formattedPost }
    }

    return { post: foundPost }
  }

  // TODO: Update this to only allow creation of media and not connection of media
  /**
   * Updates a post from the front end. Additionally creating media objects
   * @param twitterPostID
   * @param data
   */
  async update(twitterPostID: string, data: PostUpdateInput): Promise<ReturnedPosts> {
    const updatedPost = await PostsBridge.update(twitterPostID, data)
    if (updatedPost) {
      const formattedPost = this.formatForReturn(updatedPost)
      return { post: formattedPost }
    }

    return { post: updatedPost }
  }

  /**
   * Removes an array of tweets from the database (currently implemented to only support from the webhook subscription)
   * @param tweetDeleteEvents
   */
  async deleteMany(tweetDeleteEvents: TwitterDeleteEvent[]): Promise<DeletedPostsInfo> {
    const postIDs = tweetDeleteEvents.map((tweet) => tweet.id_str)
    const deletedPostsInfo = await PostsBridge.deleteMany(postIDs)

    return deletedPostsInfo
  }

  /**
   * Semi-hack means of deleting a single post
   * @param twitterPostID
   */
  async deleteOne(twitterPostID: string): Promise<DeletedPostsInfo> {
    const deletedPostsInfo = await PostsBridge.deleteMany([twitterPostID])
    return deletedPostsInfo
  }

  // FIXME: Currently Prisma2 does not support JSON types for Postgres.
  // For now this is an easy workaround but should be removed once support is available
  // See: {https://github.com/prisma/prisma2/issues/186}
  /**
   * Used to convert from a string
   * @param post
   */
  formatForReturn(post: Post): PostWithParsedDate {
    return { ...post, deconstructedDate: JSON.parse(post.deconstructedDate) }
  }
}

export default new PostsService()
