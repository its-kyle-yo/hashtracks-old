import { WebhookFactory } from '@factories';
import { UserFactory } from '@factories';
import { WebhookModel } from "@models/webhook";
import { UserModel } from "@models/user";
import { prisma } from '@prisma';
import DBManager from '../db_manager';
import { WebhookService } from '@services/Webhook';
import express from 'express';

const dbManager = new DBManager(prisma)

beforeAll(() => {
  WebhookService.initialize(express());
})

describe('Webhook Service', () => {
  const validSignature = WebhookService.generateCRC('test')
  const defaultTestWebhook = WebhookFactory.build();
  describe('Generate CRC', () => {
    beforeEach(() => {
      jest.restoreAllMocks();
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    it('should return a SHA256 CRC Token string given a string', () => {
      const token = WebhookService.generateCRC('test')
      expect(token).toContain('sha256=')
      expect(typeof token).toBe('string')
    });

    it('should throw an error when a number is provided', () => {
      expect(() => { WebhookService.generateCRC(1234) }).toThrowError();
    });

    it('should throw an error when a boolean is provided', () => {
      expect(() => { WebhookService.generateCRC(true) }).toThrowError();
    });

    it('should throw an error when an object is provided', () => {
      expect(() => { WebhookService.generateCRC({ test: true }) }).toThrowError();
    });

    it('should throw an error when null is provided', () => {
      expect(() => { WebhookService.generateCRC(null) }).toThrowError();
    });

    it('should throw an error when undefined/nothing is provided', () => {
      expect(() => { WebhookService.generateCRC() }).toThrowError();
    });
  });

  describe('Compare Signatures', () => {
    it('should return true if a digested signature matches its given body', () => {
      expect(WebhookService.compareSignatures(validSignature, 'test')).toBe(true);
    });

    it('should return false if a signature does not match its generated counterpart', () => {
      expect(WebhookService.compareSignatures(WebhookService.generateCRC('invalid'), 'test')).toBe(false);
    });

    it('should throw an error if the length of the signatures do not match', () => {
      expect(() => WebhookService.compareSignatures('a short signature', 'test')).toThrowError();
    });

    it('should throw and error if the body is null', () => {
      expect(() => WebhookService.compareSignatures(validSignature, null)).toThrowError();
    });

    it('should throw an error if the body is undefined', () => {
      expect(() => WebhookService.compareSignatures(validSignature, undefined)).toThrowError();
    });

    it('should throw an error if the body is a number', () => {
      expect(() => WebhookService.compareSignatures(validSignature, 1234)).toThrowError();
    });

    it('should throw an error if the body is an object', () => {
      expect(() => WebhookService.compareSignatures(validSignature, { test: true })).toThrowError();
    });

    it('should throw an error if the signature is an object', () => {
      expect(() => WebhookService.compareSignatures({ test: true }, 'test')).toThrowError();
    });

    it('should throw an error if the signature is an array', () => {
      expect(() => WebhookService.compareSignatures(['test'], 'test')).toThrowError();
    });

    it('should throw an error if the signature is a boolean', () => {
      expect(() => WebhookService.compareSignatures(true, 'test')).toThrowError();
    });
  });

  describe('Unregister / Delete by Twitter ID', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    it('should delete a webhook when un-registering', async () => {
      const spy = jest.spyOn(WebhookService.userActivityHook, 'unregister').mockReturnValue(true);
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      expect(newCount).toBe(1);
      const [foundWebhook] = await WebhookModel.getByTwitterID(defaultTestWebhook.twitter_webhook_id);
      delete foundWebhook.id
      expect(savedWebhook).toEqual(foundWebhook);
      await WebhookService.unregister(defaultTestWebhook.twitter_webhook_id)
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(0);
      expect(spy).toBeCalled();
      const remainingWebhooks = await WebhookModel.getByTwitterID(defaultTestWebhook.twitter_webhook_id);
      expect(remainingWebhooks.length).toBe(0);
    });

    it('should throw an error if twitter webhook id is undefined', async () => {
      expect(WebhookService.unregister()).rejects.toThrowError();
    });

    it('should throw an error if twitter webhook id is null', async () => {
      expect(WebhookService.unregister(null)).rejects.toThrowError();
    });

    it('should throw an error if twitter webhook id is a number', async () => {
      expect(WebhookService.unregister(parseInt(defaultTestWebhook.twitter_webhook_id))).rejects.toThrowError();
    });

    it('should throw an error if twitter webhook id is an object', async () => {
      expect(WebhookService.unregister(defaultTestWebhook)).rejects.toThrowError()
    });

    it('should throw an error if twitter webhook id is an array', async () => {
      expect(WebhookService.unregister([defaultTestWebhook])).rejects.toThrowError()
    });

    it('should throw an error if twitter webhook id is a boolean', async () => {
      expect(WebhookService.unregister(true)).rejects.toThrowError()
    });
  });

  describe('Verify and Update', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    it('should save a webhook if not already saved', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      await WebhookService.verifyAndUpdate(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      expect(newCount).toBe(1);
      const [foundWebhook] = await WebhookModel.getByTwitterID(defaultTestWebhook.twitter_webhook_id);
      delete foundWebhook.id
      expect(foundWebhook).toEqual(defaultTestWebhook);
    });

    it('should update an existing webhooks url', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      const testURL = 'http://example.com';
      delete savedWebhook.id
      expect(newCount).toBe(1);
      const finalCount = await dbManager.getWebhooksCount();
      const updatedWebhook = await WebhookService.verifyAndUpdate({ ...savedWebhook, url: testURL });
      expect(finalCount).toBe(1);
      expect(updatedWebhook.url).toEqual(testURL);
    });

    it('should update an existing webhooks valid status', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      const testStatus = false;
      delete savedWebhook.id
      expect(newCount).toBe(1);
      const finalCount = await dbManager.getWebhooksCount();
      const updatedWebhook = await WebhookService.verifyAndUpdate({ ...savedWebhook, valid: testStatus });
      expect(finalCount).toBe(1);
      expect(updatedWebhook.valid).toEqual(testStatus);
    });

    it('should update an existing webhooks created_timestamp', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      const testTimestamp = new Date().getTime().toString();
      delete savedWebhook.id
      expect(newCount).toBe(1);
      const finalCount = await dbManager.getWebhooksCount();
      const updatedWebhook = await WebhookService.verifyAndUpdate({ ...savedWebhook, created_timestamp: testTimestamp });
      expect(finalCount).toBe(1);
      expect(updatedWebhook.created_timestamp).toEqual(testTimestamp);
    });

    it('should update an existing webhooks environment_name', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      const testEnvironment = 'a test env';
      delete savedWebhook.id;
      expect(newCount).toBe(1);
      const finalCount = await dbManager.getWebhooksCount();
      const updatedWebhook = await WebhookService.verifyAndUpdate({ ...savedWebhook, environment_name: testEnvironment });
      expect(finalCount).toBe(1);
      expect(updatedWebhook.environment_name).toEqual(testEnvironment);
    });

    it('should not update an existing webhooks twitter_webhook_id', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      const testWebhookID = 'a test ID';
      delete savedWebhook.id;
      expect(newCount).toBe(1);
      const finalCount = await dbManager.getWebhooksCount();
      await WebhookService.verifyAndUpdate({
        ...savedWebhook, twitter_webhook_id: testWebhookID
      });
      const updatedWebhook = await WebhookService.getByTwitterID(savedWebhook.twitter_webhook_id);
      expect(finalCount).toBe(1);
      expect(updatedWebhook.twitter_webhook_id).not.toEqual(testWebhookID);
      expect(updatedWebhook.twitter_webhook_id).toEqual(defaultTestWebhook.twitter_webhook_id);
    });

    it('should not update an existing webhook if no changes are provided', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const { twitter_webhook_id } = savedWebhook;
      const newCount = await dbManager.getWebhooksCount();
      expect(newCount).toBe(1);
      const finalCount = await dbManager.getWebhooksCount();
      await WebhookService.verifyAndUpdate(savedWebhook);
      const updatedWebhook = await WebhookService.getByTwitterID(twitter_webhook_id);
      expect(finalCount).toBe(1);
      expect(updatedWebhook).toEqual(defaultTestWebhook);
    });
  });

  describe('Subscribe User', () => {
    const defaultTestUser = UserFactory.build();
    const testCredentials = {
      userId: defaultTestUser.twitter_user_id,
      accessToken: 'fakeToken',
      accessTokenSecret: 'fakeSecret'
    }
    const expectedError = new Error('Credentials Not Provided');

    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    it('should throw an error if userId is not provided', () => {
      const { accessToken, accessTokenSecret } = testCredentials;
      expect(WebhookService.subscribeUser({ accessToken, accessTokenSecret })).rejects.toThrowError(expectedError);
    });

    it('should throw an error if accessToken is not provided', () => {
      const { userId, accessTokenSecret } = testCredentials;
      expect(WebhookService.subscribeUser({ userId, accessTokenSecret })).rejects.toThrowError(expectedError);
    });

    it('should throw an error if accessTokenSecret is not provided', () => {
      const { userId, accessToken } = testCredentials;
      expect(WebhookService.subscribeUser({ userId, accessToken })).rejects.toThrowError(expectedError);
    });

    it('should throw an error if nothing is not provided', () => {
      expect(WebhookService.subscribeUser()).rejects.toThrowError();
    });

    it('should update a users subscribed status if isSubscribed returns true', async () => {
      const spy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(true);
      const savedUser = await UserModel.create({ ...defaultTestUser, isSubscribed: false });
      const userCount = await dbManager.getUsersCount();
      expect(userCount).toBe(1);
      expect(savedUser.isSubscribed).toBe(false);
      const subscribedUser = await WebhookService.subscribeUser(testCredentials);
      expect(subscribedUser.twitter_user_id).toEqual(savedUser.twitter_user_id);
      expect(spy).toBeCalled();
    });

    it('should subscribe a user and update its subscribed status if isSubscribed returns false', async () => {
      const isSubscribedSpy = jest.spyOn(WebhookService, 'isSubscribed').mockReturnValue(false);
      const subscribeSpy = jest.spyOn(WebhookService.userActivityHook, 'subscribe').mockReturnValue(true);
      const savedUser = await UserModel.create({ ...defaultTestUser, isSubscribed: false });
      const userCount = await dbManager.getUsersCount();
      expect(userCount).toBe(1);
      expect(savedUser.isSubscribed).toBe(false);
      const subscribedUser = await WebhookService.subscribeUser(testCredentials);
      expect(subscribedUser.twitter_user_id).toEqual(savedUser.twitter_user_id);
      expect(isSubscribedSpy).toBeCalled();
      expect(subscribeSpy).toBeCalled();
    });
  });

  describe('Create', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    it('should throw an error if twitter_webhook_id and id are not present', () => {
      expect(WebhookService.create({
        "created_timestamp": "1580969035315",
        "environment_name": "test",
        "url": "test",
        "valid": true
      })).rejects.toThrowError();
    });

    it('should save a new webhook to the database', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookService.create(defaultTestWebhook);
      expect(savedWebhook.twitter_webhook_id).toEqual(defaultTestWebhook.twitter_webhook_id);
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(1);
    });


    it('should save a new webhook to the database if the id is available but not twitter_webhook_id', async () => {
      const count = await dbManager.getWebhooksCount();
      const testWebhook = { ...defaultTestWebhook };
      delete testWebhook.twitter_webhook_id
      expect(count).toBe(0);
      const savedWebhook = await WebhookService.create({ ...testWebhook, id: defaultTestWebhook.twitter_webhook_id });
      expect(savedWebhook.twitter_webhook_id).toEqual(defaultTestWebhook.twitter_webhook_id);
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(1);
    });

    it('should save a new webhook to the database if the id and twitter_webhook_id are provided', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookService.create({
        ...defaultTestWebhook, id: defaultTestWebhook.twitter_webhook_id
      });
      expect(savedWebhook.twitter_webhook_id).toEqual(defaultTestWebhook.twitter_webhook_id);
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(1);
    });
  });

  describe('Create Many', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    it('should throw an error if twitter_webhook_id and id are not present', () => {
      expect(WebhookService.createMany([{
        "created_timestamp": "1580969035315",
        "environment_name": "test",
        "url": "test",
        "valid": true
      }])).rejects.toThrowError();
    });

    it('should save a list of new webhook to the database', async () => {
      const count = await dbManager.getWebhooksCount();
      const webhookList = WebhookFactory.buildList(5)
      expect(count).toBe(0);
      const savedWebhooks = await WebhookService.createMany(webhookList);
      expect(savedWebhooks).toEqual(webhookList);
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(webhookList.length);
    });


    it('should save a list of new webhook to the database if the ids are available but not twitter_webhook_id', async () => {
      const count = await dbManager.getWebhooksCount();
      const testWebhooks = WebhookFactory.buildList(5);
      const formattedWebhooks = testWebhooks.map(webhook => {
        const formattedWebhook = {
          id: webhook.twitter_webhook_id,
          ...webhook
        }
        delete formattedWebhook.twitter_webhook_id;
        return formattedWebhook;
      });
      expect(count).toBe(0);
      const savedWebhooks = await WebhookService.createMany(formattedWebhooks);
      expect(savedWebhooks).toEqual(testWebhooks);
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(formattedWebhooks.length);
    });

    it('should save a new webhook to the database if the id and twitter_webhook_id are provided', async () => {
      const count = await dbManager.getWebhooksCount();
      const testWebhooks = WebhookFactory.buildList(5);
      const formattedWebhooks = testWebhooks.map(webhook => ({ id: webhook.twitter_webhook_id, ...webhook }));
      expect(count).toBe(0);
      const savedWebhooks = await WebhookService.createMany(formattedWebhooks);
      expect(savedWebhooks).toEqual(testWebhooks);
      const finalCount = await dbManager.getWebhooksCount();
      expect(finalCount).toBe(formattedWebhooks.length);
    });
  });

  describe('Get By Twitter ID', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    it('should return a webhook given an ID', async () => {
      const count = await dbManager.getWebhooksCount();
      expect(count).toBe(0);
      const savedWebhook = await WebhookModel.create(defaultTestWebhook);
      const newCount = await dbManager.getWebhooksCount();
      expect(newCount).toBe(1);
      const returnedWebhook = await WebhookService.getByTwitterID(savedWebhook.twitter_webhook_id);
      expect(savedWebhook).toEqual(returnedWebhook);
    });

    it('should throw an error if a twitter_webhook_id is not provided', async () => {
      expect(WebhookService.getByTwitterID()).rejects.toThrow()
    })
  });

  describe('Get Webhooks', () => {
    beforeEach(async () => {
      await dbManager.dropDatabase();
      await jest.restoreAllMocks();
    });

    afterEach(async () => {
      await dbManager.dropDatabase();
    });

    it('should return a list of webhooks', async () => {
      const webhooksList = WebhookFactory.buildList(5);
      const createdWebhooks = await WebhookService.createMany(webhooksList);
      expect(createdWebhooks.length).toBe(5);
      const count = await dbManager.getWebhooksCount();
      const returnedWebhooks = await WebhookService.getWebhooks();
      expect(count).toBe(5);
      expect(returnedWebhooks.length).toBe(createdWebhooks.length);
    });
  });
});