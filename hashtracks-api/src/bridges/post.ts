/* TODO: Create separate find functions for future bulk find by post properties
  e.g. find by hashtag, createdAt range
*/
// Modules
import { prisma } from '@root/server'
import Knex from 'knex'

// Config
import config from '@config'

// Types
import { Post, PostUpdateInput } from '@prisma/client'
import { SearchCriteria, CreatePostInput, DeletedPostsInfo } from 'CustomTypes'

/**
 * Makes all Post related database interactions via Prisma from calls from services
 */
export class PostsBridge {
  /**
   * create
   * @param {CreatePostInput} postWithAuthor - A post that has been passed through formatTweet helper with the ID for the user that created it.
   * @returns {Post} - A saved and usable post for the frontend
   */
  async create({ formattedPost, for_user_id: twitterUserID }: CreatePostInput): Promise<Post> {
    const createdPost = await prisma.post.create({
      data: {
        ...formattedPost,
        hashtags: {
          set: formattedPost.hashtags,
        },
        media: {
          create: formattedPost.media,
        },
        author: {
          connect: {
            twitterUserID,
          },
        },
      },
    })

    return createdPost
  }

  /**
   * Finds all posts of a given user
   * @param {string} twitterUserID - The user ID provided from TWitter that is associated with an account
   * @returns {Post[]} - An array of all posts a user has made that have been sent via subscription and saved
   */
  async findAll(twitterUserID: string): Promise<Post[]> {
    const foundPosts = await prisma.post.findMany({
      where: {
        author: {
          twitterUserID,
        },
      },
      include: {
        media: true,
        author: true,
      },
    })

    return foundPosts
  }

  /**
   * Finds a single post based on any Search Criteria
   * @param {SearchCriteria} param0 - Filter: A key on the post to look for. Value: The value of the Filter key
   * @returns {Post | null}
   */
  async findOne({ filter, value }: SearchCriteria): Promise<Post | null> {
    const foundPost = await prisma.post.findOne({
      where: {
        [filter]: value,
      },
      include: {
        media: true,
        author: true,
      },
    })

    return foundPost
  }

  /**
   * Updates a posts content based on the data object provided
   * @param twitterPostID
   * @param data
   */
  async update(twitterPostID: string, data: PostUpdateInput): Promise<Post | null> {
    const updatedPost = await prisma.post.update({
      where: { twitterPostID },
      include: { media: true },
      data,
    })

    return updatedPost
  }

  // FIXME: At some point knex needs to be removed
  // Currently this is implemented as is due to lack of CASCADE DELETE support from
  // prisma2 see: {https://github.com/prisma/migrate/issues/249}
  /**
   * Bulk deletes multiple unique post objects (not posts based on criteria)
   * @param tweetDeleteEventIDs
   */
  async deleteMany(tweetDeleteEventIDs: string[]): Promise<DeletedPostsInfo> {
    const deletedIDs = []
    const counts = {
      posts: 0,
      media: 0,
    }

    // Create a connection directly to the DB rather than through prisma
    const knex = Knex({ client: `pg`, connection: config.database.url })

    // For each ID we're provided we need to find the post and delete its media
    for await (const twitterPostID of tweetDeleteEventIDs) {
      const options = { where: { twitterPostID } }
      // Get the current post
      const post = await prisma.post.findOne(options)
      // Delete the media via knex
      const deletedMediaCount = await knex(`Media`).where(`postID`, post?.id).delete()
      // Delete the parent post
      const deleted = await prisma.post.delete(options)
      if (deleted) {
        counts.posts += 1
        counts.media += deletedMediaCount
      }
      // Since 'deleted' is the deleted object we can add the ID to the list of IDs removed
      deletedIDs.push(deleted.id)
    }

    // Close the knex connection
    await knex.destroy()
    return { deletedIDs, counts }
  }
}

export default new PostsBridge()
