// Modules
import { prisma } from '@root/server'
import Knex from 'knex'

// Helpers
import { CUSTOM_ERRORS, deepLogObject } from '@helpers'

// Config
import config from '@config'

// Types
import {
  User, UserInclude, UserUpdateInput, FindOneUserArgs,
} from '@prisma/client'
import { FormattedUser } from 'CustomTypes'


/**
 * The UsersBridge is used for interactions between the service layer and the database via Prisma
 */
export class UsersBridge {
  /**
   * Creates a default user and saves it to the database
   * @param formattedUser
   */
  async create(formattedUser: FormattedUser): Promise<User> {
    const createdUser = await prisma.user.create({
      data: {
        ...formattedUser,
      },
      include: {
        commitments: true,
        posts: true,
      },
    })

    return createdUser
  }

  /**
   * Finds a User based on a given ID with options on data to include and return
   * @param twitterUserID
   * @param options
   */
  async findOne(twitterUserID: string, options?: UserInclude): Promise<User | null> {
    deepLogObject({ twitterUserID, options }, `Find One Details:`)
    const query: FindOneUserArgs = {
      where: { twitterUserID },
    }

    if (options) {
      query.include = { ...options }
    }

    const foundUser = await prisma.user.findOne(query)

    return foundUser
  }

  // TODO: Implement this.
  // NOTE: This method is meant to be used for social features at a point in the future for users to search for others
  // async findAllBy(): Promise<User> { }

  /**
   * Updates a given users info
   * @param twitterUserID
   * @param data
   * @param options
   */

  // TODO: Update this to not allow changes of unique data
  async update(twitterUserID: string, data: UserUpdateInput, options?: UserInclude) {
    const dataKeys = Object.keys(data)
    if (dataKeys.includes(`twitterUserID`) || dataKeys.includes(`id`)) {
      throw CUSTOM_ERRORS.BAD_REQUEST
    }

    const updatedUser = await prisma.user.update({
      where: { twitterUserID },
      data,
      include: { ...options },
    })

    return updatedUser
  }

  /**
   * Deletes a given user and all sub content
   * TODO: Delete all commitments on user delete
   * @param twitterUserID
   */
  async delete(twitterUserID: string): Promise<any> {
    // Start counts to be returned
    const counts = {
      user: 0,
      post: 0,
      media: 0,
    }

    // Open connection directly to DB via knex instead of through Prisma
    const knex = Knex({ client: `pg`, connection: config.database.url })
    // Query for the internal ID for the associated user in the DB
    const userQuery = knex.select(`id`).from(`User`).where(`twitterUserID`, twitterUserID)
    // Get the user
    const [user] = await userQuery
    if (user?.id) {
      // Start query for post IDs connected to found user if any
      const postsQuery = knex.select(`id`).from(`Post`).where(`authorID`, user.id)
      // Get all the posts IDs
      const posts = await postsQuery
      if (posts.length) {
        // For each post check if any media exists and delete.
        for await (const post of posts) {
          const deletedPost = await knex(`Media`).where(`postID`, post.id).delete()
          counts.media += deletedPost
        }
        // Once media is deleted delete the parent post
        counts.post = await postsQuery.delete()
      }
      // Once all posts are deleted delete the user
      counts.user = await userQuery.delete()
      // Close the knex connection
      await knex.destroy()
      // Return all IDs for the user and posts
      return { ...counts, user, posts }
    }
    // If a user isn't found close the connection and return the default counts
    await knex.destroy()
    return { ...counts }
  }
}

export default new UsersBridge()
