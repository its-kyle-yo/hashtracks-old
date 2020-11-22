import { prisma } from "@prisma";
export class PostModel {
  // Create
  static async create(payload) {
    const { post, authorID } = payload
    const createdPost = await prisma.createPost({
      ...post,
      hashtags: {
        set: [...post.hashtags]
      },
      media: {
        create: post.media?.length ? [...post.media] : []
      },
      author: {
        connect: {
          twitter_user_id: authorID
        }
      }
    });
    const media = await prisma.post({ twitter_post_id: createdPost.twitter_post_id }).media();
    return {
      ...post,
      media
    }
  }

  // Read
  static async getPostByTwitterID(twitter_post_id) {
    return await prisma.post({ twitter_post_id });
  }

  static async getPostByID(id) {
    return await prisma.post({ id });
  }

  static async getAll() {
    return await prisma.posts();
  }

  // Update
  static async updatePostByTwitterID(twitter_post_id, data) {
    return await prisma.updatePost({
      where: { twitter_post_id },
      data
    });
  }
  // Delete

  static async deleteByTwitterID(twitter_post_id) {
    return await prisma.deletePost({ twitter_post_id });
  }

  static async deleteMany(postIDs) {
    return await prisma.deleteManyPosts({
      twitter_post_id_in: postIDs
    })
  }
}