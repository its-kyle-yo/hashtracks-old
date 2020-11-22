import { UserFactory } from '@factories'
import { UserModel } from '@models/user';
import { prisma } from "@prisma";
import DBManager from "../db_manager";

const dbManager = new DBManager(prisma);
beforeEach(async () => {
  await dbManager.dropDatabase(prisma);
  await jest.restoreAllMocks();
});

const defaultTestUser = UserFactory.build();

describe('User Model:', () => {
  describe('Create', () => {
    // TODO: Create test cases for missing params
    it('should create and return a user', async () => {
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toBe(0);
      const savedUser = await UserModel.create({ isSubscribed: true, ...defaultTestUser });
      const newCount = await dbManager.getUsersCount(prisma);
      expect(newCount).toEqual(1);
      expect(savedUser.twitter_user_id).toBe(defaultTestUser.twitter_user_id);
    });

    it('should create an empty array of commitments when creating a new user', async () => {
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toBe(0);
      const savedUser = await UserModel.create({ isSubscribed: true, ...defaultTestUser });
      const newCount = await dbManager.getUsersCount(prisma);
      expect(newCount).toEqual(1);
      expect(savedUser.twitter_user_id).toBe(defaultTestUser.twitter_user_id);
      const user = await UserModel.findByID(savedUser.id)
      expect(Array.isArray(user.commitments)).toBe(true)
    })

    it('should create an empty array of posts when creating a new user', async () => {
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toBe(0);
      const savedUser = await UserModel.create({ isSubscribed: true, ...defaultTestUser });
      const newCount = await dbManager.getUsersCount(prisma);
      expect(newCount).toEqual(1);
      expect(savedUser.twitter_user_id).toBe(defaultTestUser.twitter_user_id);
      const user = await UserModel.findByID(savedUser.id)
      expect(Array.isArray(user.posts)).toBe(true)
    })
  });

  describe('Find By Twitter ID', () => {
    it('should return an existing user', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      const returnedUser = await UserModel.findByTwitterID(createdUser.twitter_user_id);
      expect(returnedUser.twitter_user_id).toEqual(createdUser.twitter_user_id);
    });
  });

  describe('Find By ID', () => {
    it('should return an existing user', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      const returnedUser = await UserModel.findByID(createdUser.id);
      expect(returnedUser.id).toEqual(createdUser.id);
    });
  });

  describe('Update By Twitter ID', () => {
    it('should update the users subscribed status', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      expect(createdUser.isSubscribed).toBe(false);
      const updatedUser = await UserModel.updateByTwitterID(createdUser.twitter_user_id, { isSubscribed: true });
      expect(updatedUser.isSubscribed).toBe(true);
      expect(updatedUser.twitter_user_id).toEqual(createdUser.twitter_user_id);
    });

    it('should update the users profile image url', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const testUrl = "A test url"
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      expect(createdUser.profile_image_url).toEqual(defaultTestUser.profile_image_url);
      const updatedUser = await UserModel.updateByTwitterID(createdUser.twitter_user_id, { profile_image_url: testUrl });
      expect(updatedUser.profile_image_url).toEqual(testUrl);
      expect(updatedUser.twitter_user_id).toEqual(createdUser.twitter_user_id);
    });

    it('should update the users name', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const testName = "New Name"
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      expect(createdUser.name).toEqual(defaultTestUser.name);
      const updatedUser = await UserModel.updateByTwitterID(createdUser.twitter_user_id, { name: testName });
      expect(updatedUser.name).toEqual(testName);
      expect(updatedUser.twitter_user_id).toEqual(createdUser.twitter_user_id);
    });

    it('should update the users twitter handle', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      const testHandle = '@testUser'
      expect(count).toEqual(1);
      expect(createdUser.twitter_handle).toEqual(defaultTestUser.twitter_handle);
      const updatedUser = await UserModel.updateByTwitterID(createdUser.twitter_user_id, { twitter_handle: testHandle });
      expect(updatedUser.twitter_handle).toEqual(testHandle);
      expect(updatedUser.twitter_user_id).toEqual(createdUser.twitter_user_id);
    });

    it('should throw an error when attempting to update the twitter user ID', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      const testTwitterUserID = 1137;
      expect(count).toEqual(1);
      expect(createdUser.twitter_user_id).toEqual(defaultTestUser.twitter_user_id);
      expect(UserModel.updateByTwitterID(createdUser.twitter_user_id, { twitter_user_id: testTwitterUserID })).rejects.toThrow();
    });
  });

  describe('Delete By Twitter ID', () => {
    it('should throw an error if twitter user id is not present', () => {
      expect(UserModel.deleteByTwitterID()).rejects.toThrowError(new Error('ID Not Provided'))
    });

    it('should throw an error if twitter user id is empty', () => {
      expect(UserModel.deleteByTwitterID('')).rejects.toThrowError(new Error('ID Not Provided'))
    });

    it('should delete a user with a twitter id', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      await UserModel.deleteByTwitterID(createdUser.twitter_user_id);
      const newCount = await dbManager.getUsersCount(prisma);
      expect(newCount).toEqual(0);
    });
  });

  describe('User Exists', () => {
    it('should return true if a user exists', async () => {
      const createdUser = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(1);
      const userExists = await UserModel.userExists(createdUser.twitter_user_id);
      expect(userExists).toBe(true)
    });

    it('should return false if a user does not exist', async () => {
      const count = await dbManager.getUsersCount(prisma);
      expect(count).toEqual(0);
      const userExists = await UserModel.userExists(defaultTestUser.twitter_user_id);
      expect(userExists).toBe(false)
    });

    it('should throw an error if a twitter user id is not defined', async () => {
      expect(UserModel.userExists()).rejects.toThrowError(new Error('ID Not Provided'));
    });

    it('should throw an error if a twitter user id is empty', async () => {
      expect(UserModel.userExists()).rejects.toThrowError(new Error('ID Not Provided'));
    });
  });
});