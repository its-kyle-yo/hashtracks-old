// Bridges
import { UsersBridge } from '@bridges'

// Services
import { WebhooksService } from '@services'

// Helpers
import { CUSTOM_ERRORS } from '@helpers'

// Types
import {
  User, UserInclude, UserUpdateInput, UserSelect,
} from '@prisma/client'
import { TwitterUserObject, TwitterCredentials } from 'twitter'
import { FormattedUser, FormattedCredentials } from 'CustomTypes'

/**
 * The Users Service handles all interactions between the Users Bridge and interacts with
 * the Webhooks Service
 *
 * As of now the UsersService functions as the gateway to logging or registering a
 * user based on a sign in action from the frontend. Deletion of a user is currently
 * based only on the revocation of the apps subscription to that user but will in the future
 * allow a user to delete their account or unsubscribe their twitter activity while still
 * maintaining the content they already have saved
 */
export class UsersService {
  /**
   * Finds and returns a users last 2 months of posts where as anything further than that
   * will have either been cached on the frontend or will be fetched at a later time
   * @param twitterUserID
   */
  async login(twitterUserID: string): Promise<{ user: User | {} }> {
    const options: UserInclude = {
      commitments: true,
      posts: {
        last: 60,
        orderBy: {
          createdAt: `desc`,
        },
      },
    }

    const foundUser = await UsersBridge.findOne(twitterUserID, options)

    return { user: { ...foundUser } }
  }

  // TODO: Check to see how/if an error should be thrown if credentials are not correct
  /**
   * If a user account does not exist one will be created given it has passed all necessary
   * checks in the middleware and a subscription will be made to their account activity
   * via the Webhooks Service
   * @param user
   * @param credentials
   */
  async register(user: TwitterUserObject, credentials: TwitterCredentials): Promise<{ user: User } | undefined> {
    // 1. If credentials are present
    if (credentials?.accessToken && credentials?.secret) {
      // 2. Format the user in the form the database will accept
      const formattedUser = this.formatUser(user)
      // 3. Format the credentials that the Webhooks Service needs
      const formattedCredentials = this.formatCredentials(credentials)

      // 4. Create the initial user
      let registeredUser = await UsersBridge.create(formattedUser)
      // 5. Attempt to subscribe the user
      const subscriptionStatus = await this.subscribe(formattedUser.twitterUserID, formattedCredentials)
      if (subscriptionStatus.subscriptionSuccessful) {
        // 5.a  Update the registered user to reflect its subscription status
        // TODO: If it is not subscribed attempt to resubscribe user at a later time
        registeredUser = await UsersBridge.update(
          formattedUser.twitterUserID,
          { isSubscribed: true },
          { commitments: true, posts: true },
        )
      }
      // 6. Return the registered/updated user
      return { user: { ...registeredUser } }
    }

    throw CUSTOM_ERRORS.BAD_REQUEST
  }

  /**
   * Calls the Webhooks Service to attempt to subscribe a user to the servers webhook
   * @param id
   * @param credentials
   */
  subscribe(id: string, credentials: FormattedCredentials) {
    return WebhooksService.subscribeToWebhook(id, credentials)
  }

  /**
   * TODO: Given a user ID unsubscribe the webhook from that users account activity while keeping their account and current data
   */
  // async unsubscribe() { }

  /**
   * Returns a useable User object
   * @param user
   */
  formatUser(user: TwitterUserObject): FormattedUser {
    return {
      twitterUserID: user.twitter_user_id,
      profileImageUrl: user.profile_image_url,
      name: user.name,
      twitterHandle: user.twitter_handle,
    }
  }

  /**
   * Returns a useable Credentials object
   * @param credentials
   */
  formatCredentials(credentials: TwitterCredentials): FormattedCredentials {
    return {
      accessTokenSecret: credentials.secret,
      ...credentials,
    }
  }

  /**
   * Finds a single user based on their External ID
   * @param twitterUserID
   */
  async findOne(twitterUserID: string): Promise<{ user: UserSelect | {} }> {
    const foundUser = await UsersBridge.findOne(twitterUserID)
    return { user: { ...foundUser } }
  }

  async update(twitterUserID: string, data: UserUpdateInput): Promise<{ user: UserSelect | {} }> {
    const options = {
      commitments: false,
      posts: false,
    }

    const updatedUser = await UsersBridge.update(twitterUserID, data, options)
    return { user: { ...updatedUser } }
  }

  /**
   * Attempts to find a user. Checks one exists and has an ID from the database (which is auto-generated on creation)
   * @param twitterUserID
   */
  async exists(twitterUserID: string): Promise<boolean> {
    const foundUser = await UsersBridge.findOne(twitterUserID)
    return !!foundUser
  }

  /**
   * Deletes a user and all related data from the platform
   * TODO: When initiated by a user and NOT from a revocation event the user must then be unsubscribed from the webhook
   * @param twitterUserID
   */
  // async delete(twitterUserID: string): Promise<boolean> {
  async delete(twitterUserID: string) {
    const isDeleted = await UsersBridge.delete(twitterUserID)
    return isDeleted
  }
}

export default new UsersService()
