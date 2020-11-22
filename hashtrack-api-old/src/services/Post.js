import pmap from "p-map"
import { PostModel } from '@models/post';
import { UserModel } from '@models/user';
import { formatPost } from './helpers';
import { prisma } from "@prisma";

export class PostService {
  static async create(payload) {
    // Check if user exists for saving posts
    const { authorID } = payload
    const user = await UserModel.userExists(authorID);
    console.warn({ user })
    if (user) {
      console.warn('attempting to create posts')
      const createdPosts = await this.createMany(payload);
      console.warn({ createdPosts });
      return createdPosts;
    }
    throw new Error('User Not Found')
  }

  static async createMany({ posts, authorID }) {
    try {
      console.warn('In create Many')
      const postsArray = posts.length ? posts : [posts];
      const createdPosts = await pmap(postsArray, async (event) => {
        const formattedPost = formatPost(event);
        if (formattedPost) {
          return await PostModel.create({ post: formattedPost, authorID });
        }
      }, { concurrency: 500, stopOnError: true });
      console.warn({ createdPosts })
      return createdPosts;
    } catch (err) {
      return err
    }
  }

  static async getAll(twitter_user_id) {
    try {
      const query = `
      query($twitter_user_id: String) {
        posts(where:{author:{twitter_user_id: $twitter_user_id}}){
          twitter_post_id
          created_at
          deconstructed_date
          text
          source
          hashtags
          media {
            type
            twitter_media_id
            image_url
            video_url
          }
        }
      }
      `
      const posts = await prisma.$graphql(query, { twitter_user_id });
      if (posts.length) {
        const formattedPosts = posts.map((post) => {
          const postDate = new Date(post.created_at);
          const formattedPost = {
            ...post,
            created_at: {
              day: postDate.getDay(),
              month: postDate.getMonth(),
              year: postDate.getFullYear()
            },
          }
          return formattedPost
        });

        return formattedPosts;
      }

      return posts
    } catch (err) {
      throw err;
    }
  }

  static async getPostByTwitterID(twitter_post_id) {
    try {
      return await PostModel.getPostByTwitterID({ twitter_post_id })
    } catch (err) {
      throw err;
    }
  }

  static async updateByTwitterID({ postID, data }) {
    try {
      return await PostModel.updatePostByTwitterID(postID, data)
    } catch (err) {
      throw err;
    }
  }

  static async deleteByTwitterID(twitter_post_id) {
    try {
      return await PostModel.deleteOne({ twitter_post_id });
    } catch (err) {
      throw err;
    }
  }

  static async deleteMany(event) {
    try {
      const postsIDsToBeDeleted = await pmap(event.tweet_delete_events, async (event) => {
        return event.status.id;
      }, { concurrency: 500, stopOnError: false });
      return await PostModel.deleteMany(postsIDsToBeDeleted);
    } catch (err) {
      throw err;
    }
  }
}