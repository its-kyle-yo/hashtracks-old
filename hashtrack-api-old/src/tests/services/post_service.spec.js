import { WebhookFactory } from '@factories';
import { UserFactory } from '@factories';
import { PostFactory } from '@factories';
import { UserModel } from "@models/user";
import { PostModel } from "@models/post";
import { prisma } from '@prisma';
import DBManager from '../db_manager';
import { PostService } from '@services/Post';

const dbManager = new DBManager(prisma);

describe('Post Service', () => {
  const defaultTestUser = UserFactory.build();
  const defaultTestPost = PostFactory.build();

  describe('Create', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
    });

    it.skip('should save a post to a given user', async () => {
      const postsCount = await dbManager.getPostsCount();
      const usersCount = await dbManager.getUsersCount();
      expect(postsCount).toBe(0);
      expect(usersCount).toBe(0);
      const savedUser = await UserModel.create(defaultTestUser);
      const newUsersCount = await dbManager.getUsersCount();
      expect(newUsersCount).toBe(1);
      const savedPost = await PostService.create({
        authorID: savedUser.twitter_user_id, posts: defaultTestPost
      });
    });
  });
});