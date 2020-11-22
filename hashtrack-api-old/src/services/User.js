import { UserModel } from '@models/user';
import { WebhookService } from "@services/Webhook";

export class UserService {
  static async login(payload) {
    try {
      const { user, credentials } = payload;
      if (user && !!user.twitter_user_id) {
        let foundUser = await UserModel.findByTwitterID(user.twitter_user_id);
        if (foundUser) {
          if (foundUser.isNewUser) {
            foundUser = await UserModel.updateByTwitterID(foundUser.twitter_user_id, { isNewUser: false });
          }

          if (foundUser.isSubscribed) {
            return foundUser;
          }

          const { accessToken, secret } = credentials;
          const formattedCredentials = { accessToken, accessTokenSecret: secret, userId: user.twitter_user_id }
          const subscribedUser = await this.subscribeUser(formattedCredentials);
          return subscribedUser
        } else {
          if (credentials && !!credentials.accessToken && !!credentials.secret) {
            const createdUser = await this.registerUser(payload);
            return createdUser
          } else {
            throw new Error('Credentials Are Not Valid')
          }
        }
      } else {
        throw new Error('User Object Is Invalid');
      }
    } catch (err) {
      throw err
    }
  }

  static async registerUser({ credentials, user }) {
    try {
      // Register user subscription to endpoint
      const { accessToken, secret } = credentials
      const formattedCredentials = { accessToken, accessTokenSecret: secret, userId: user.twitter_user_id }
      if (!!accessToken && !!secret) {
        await UserModel.create(user);
        const updatedUser = await this.subscribeUser(formattedCredentials);
        return updatedUser;
      } else {
        throw new Error('Unauthorized')
      }
    } catch (err) {
      throw err;
    }
  }

  static async subscribeUser(formattedCredentials) {
    if (formattedCredentials) {
      return await WebhookService.subscribeUser(formattedCredentials);
    }
    throw new Error('Formatted Credentials Not Provided');
  }

  static async deleteByTwitterID(twitter_user_id) {
    if (!!twitter_user_id) {
      return await UserModel.deleteByTwitterID(twitter_user_id)
    }

    throw new Error('ID Not provided')
  }
} 