import { prisma } from "@prisma";
export class UserModel {
  // Create
  static async create(user) {
    if (user) {
      const createdUser = await prisma.createUser({
        ...user,
        commitments: {
          create: []
        }
      });

      return this.findByTwitterID(createdUser.twitter_user_id);
    }
    throw new Error('User not defined')
  }

  // Read
  static async findByTwitterID(twitter_user_id) {
    const query = `
      query($twitter_user_id: String) {
        user(where:{twitter_user_id: $twitter_user_id}){
          id
          twitter_user_id
          twitter_handle
          isSubscribed
          isNewUser
          profile_image_url
          name
          commitments {
            id
          }
          posts {
            twitter_post_id
          }
        }
      }
    `
    const { user } = await prisma.$graphql(query, { twitter_user_id });
    return user;
  }

  static async findByID(id) {
    const query = `
      query($id: ID!) {
        user(where:{id: $id}){
          id
          twitter_user_id
          twitter_handle
          isSubscribed
          profile_image_url
          name
          commitments {
            id
          }
          posts {
            twitter_post_id
          }
        }
      }
    `
    const { user } = await prisma.$graphql(query, { id });
    return user;
  }

  // Update
  static async updateByTwitterID(twitter_user_id, data) {
    if (data.hasOwnProperty('twitter_user_id')) {
      throw new Error('Twitter User ID cannot be updated');
    }
    return await prisma.updateUser({ where: { twitter_user_id }, data });
  }
  // Delete

  static async deleteByTwitterID(twitter_user_id) {
    if (twitter_user_id) {
      return await prisma.deleteUser({ twitter_user_id });
    }
    throw new Error('ID Not Provided')
  }

  // Misc 
  static async userExists(twitter_user_id) {
    if (twitter_user_id) {
      return await prisma.$exists.user({ twitter_user_id });
    }
    throw new Error('ID Not Provided')
  }
}