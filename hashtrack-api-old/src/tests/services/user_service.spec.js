import { UserFactory } from '@factories'
import { UserModel } from '@models/user';
import { prisma } from '@prisma';
import DBManager from "../db_manager";
import { WebhookService } from "@services/Webhook";
import { UserService } from '@services/User';

const dbManager = new DBManager(prisma);

beforeEach(async () => {
  await dbManager.dropDatabase(prisma)
  await jest.restoreAllMocks();
});

const defaultTestUser = UserFactory.build();
const credentials = { accessToken: 'fakeToken', secret: 'fakeSecret' };

describe('User Service:', () => {
  describe('Login', () => {
    it('should throw a type error if a user object is not provided', async () => {
      const count = await dbManager.getUsersCount();
      expect(count).toBe(0);
      expect(UserService.login()).rejects.toThrow(TypeError);
      const newCount = await dbManager.getUsersCount();
      expect(newCount).toBe(0);
    });

    it('should throw an error if twitter_user_id is not defined', async () => {
      const user = UserFactory.build();
      delete user.twitter_user_id;
      const count = await dbManager.getUsersCount();
      expect(count).toBe(0);
      expect(UserService.login({ user })).rejects.toThrowError(new Error('User Object Is Invalid'));
      const newCount = await dbManager.getUsersCount();
      expect(newCount).toBe(0);
    });

    it('should return a user if one exists', async () => {
      const createdUser = await UserModel.create({ ...defaultTestUser, isSubscribed: true });
      delete createdUser.id;
      const count = await dbManager.getUsersCount();
      expect(count).toBe(1);
      const existingUser = await UserService.login({ user: { ...defaultTestUser }, credentials });
      expect(existingUser.twitter_user_id).toEqual(createdUser.twitter_user_id);
    });

    it('should subscribe a saved user that is not subscribed', async () => {
      const user = await UserModel.create(defaultTestUser);
      const count = await dbManager.getUsersCount();
      expect(count).toBe(1);
      expect(user.isSubscribed).toBe(false);
      const spy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(true)
      const returnedUser = await UserService.login({ user, credentials })
      expect(returnedUser.twitter_user_id).toEqual(user.twitter_user_id);
      expect(returnedUser.isSubscribed).toBe(true);
      expect(spy).toBeCalled();
    });

    it('should return a new user if one is not found', async () => {
      const count = await dbManager.getUsersCount();
      expect(count).toEqual(0);
      const spy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(true)
      const savedUser = await UserService.login({ user: { ...defaultTestUser, isSubscribed: true }, credentials });
      const newCount = await dbManager.getUsersCount();
      expect(newCount).toEqual(1);
      expect(savedUser.twitter_user_id).toEqual(defaultTestUser.twitter_user_id);
      expect(spy).toBeCalled();
    });

    it('should delete a provided user by the twitter id', async () => {
      const count = await dbManager.getUsersCount();
      expect(count).toEqual(0);
      const savedUser = await UserModel.create({ ...defaultTestUser, isSubscribed: true });
      const newCount = await dbManager.getUsersCount();
      expect(newCount).toEqual(1);
      await UserService.deleteByTwitterID(savedUser.twitter_user_id);
      const finalCount = await dbManager.getUsersCount();
      expect(finalCount).toEqual(0);
    });

    it('should set isNewUser to true when logging in a user for the first time', async () => {
      const user = UserFactory.build()
      delete user.isNewUser;
      const spy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(true)
      const count = await dbManager.getUsersCount();
      expect(count).toEqual(0)
      const savedUser = await UserService.login({ user, credentials })
      expect(savedUser.isNewUser).toBe(true);
      expect(spy).toBeCalled();
    });

    it('should set isNewUser to false when logging in a user that already exists', async () => {
      const count = await dbManager.getUsersCount();
      expect(count).toEqual(0);
      const user = await UserModel.create({ ...defaultTestUser, isSubscribed: true });
      const newCount = await dbManager.getUsersCount();
      expect(newCount).toEqual(1);
      const loggedInUser = await UserService.login({ user, credentials });
      expect(loggedInUser.isNewUser).toBe(false)
    });

    describe('credentials', () => {
      it('should throw an error if credentials are not defined', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.login({ user: defaultTestUser })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the accessToken is not preset', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.login({ user: defaultTestUser, credentials: { secret: 'fakeSecret' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the secret is not preset', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.login({ user: defaultTestUser, credentials: { accessToken: 'fakeToken' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the secret is empty', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.login({ user: defaultTestUser, credentials: { accessToken: 'fakeToken', secret: '' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the accessToken is empty', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.login({ user: defaultTestUser, credentials: { accessToken: '', secret: 'fakeSecret' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });
    });

    describe('Register User', () => {
      it('should create and update a users subscribed status', async () => {
        const spy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(true)
        const count = await dbManager.getUsersCount();
        expect(count).toBe(0);
        const returnedUser = await UserService.registerUser({ user: { ...defaultTestUser, isSubscribed: true }, credentials });
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toBe(1)
        expect(returnedUser.twitter_user_id).toBe(defaultTestUser.twitter_user_id);
        expect(spy).toBeCalled();
      });

      it('should throw an error if credentials are not defined', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.registerUser({ user: defaultTestUser })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the accessToken is not preset', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.registerUser({ user: defaultTestUser, credentials: { secret: 'fakeSecret' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the secret is not preset', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.registerUser({ user: defaultTestUser, credentials: { accessToken: 'fakeToken' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the secret is empty', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.registerUser({ user: defaultTestUser, credentials: { accessToken: 'fakeToken', secret: '' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });

      it('should throw an error if the accessToken is empty', async () => {
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(0);
        expect(UserService.registerUser({ user: defaultTestUser, credentials: { accessToken: '', secret: 'fakeSecret' } })).rejects.toThrowError()
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });
    });

    describe('Subscribe User', () => {
      let formattedCredentials = { accessToken: 'fakeToken', accessTokenSecret: 'fakeSecret' }
      it('should throw an error when formatted credentials are not provided', () => {
        expect(UserService.subscribeUser()).rejects.toThrowError(new Error('Formatted Credentials Not Provided'))
      });

      it('should return an unsubscribed user as subscribed', async () => {
        const spy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(true);
        const count = await dbManager.getUsersCount();
        expect(count).toBe(0);
        const createdUser = await UserModel.create(defaultTestUser)
        const returnedUser = await UserService.subscribeUser({
          userId: defaultTestUser.twitter_user_id, ...formattedCredentials
        })
        expect(createdUser.isSubscribed).toBe(false);
        expect(returnedUser.isSubscribed).toBe(true);
        expect(returnedUser.twitter_user_id).toEqual(defaultTestUser.twitter_user_id);
        expect(spy).toBeCalled();
      });
    });

    describe('Delete By Twitter ID', () => {
      it('should throw an error if twitter user id is not present', () => {
        expect(UserService.deleteByTwitterID()).rejects.toThrowError(new Error('ID Not provided'))
      });

      it('should throw an error if twitter user id is empty', () => {
        expect(UserService.deleteByTwitterID('')).rejects.toThrowError(new Error('ID Not provided'))
      });

      it('should delete a user with a twitter id', async () => {
        const createdUser = await UserModel.create(defaultTestUser);
        const count = await dbManager.getUsersCount();
        expect(count).toEqual(1);
        await UserService.deleteByTwitterID(createdUser.twitter_user_id);
        const newCount = await dbManager.getUsersCount();
        expect(newCount).toEqual(0);
      });
    });
  });
});
