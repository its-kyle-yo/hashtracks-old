import crypto from 'crypto';
import pmap from 'p-map';
import { userActivity } from "twitter-webhooks";
import { UserModel } from "@models/user";
import { WebhookModel } from "@models/webhook";
import { isEqual } from 'lodash';
import { renameProperty } from './helpers';
import config from '@config';

/**
 * @namespace
 */
export class WebhookService {

  /**
   * @property {Object} userActivityHook - Twitter Webhooks Module
   */
  static userActivityHook;

  /**
   * @memberof WebhookService
   * @param {Object} app 
   */
  static initialize(app) {
    const { twitter } = config;
    const userActivityWebhook = userActivity({
      serverUrl: twitter.serverUrl,
      route: twitter.route,
      consumerKey: twitter.consumerKey,
      consumerSecret: twitter.consumerSecret,
      accessToken: twitter.accessToken,
      accessTokenSecret: twitter.accessTokenSecret,
      environment: twitter.environment,
      appBearerToken: twitter.appBearerToken,
      app
    });

    this.userActivityHook = userActivityWebhook;
  }

  /**
   * Returns a SHA256 CRC Token 
   * @param {string} crcToken - A token to be converted into a SHA256 CRC Token
   */
  static generateCRC(crcToken) {
    const { twitter } = config;
    const hmac = crypto
      .createHmac('sha256', twitter.consumerSecret)
      .update(crcToken)
      .digest('base64')
    return `sha256=${hmac}`
  }

  /**
   * Creates and compares a given signature based on the requests body and the consumerSecret
   * @param {string} signature - SHA256 CRC Token to compare against
   * @param {string} body - Raw UTF-8 Stringified Request Body
   */
  static compareSignatures(signature, body) {
    const { twitter } = config;
    const hmac = crypto
      .createHmac('sha256', twitter.consumerSecret)
      .update(body)
      .digest('base64')
    const generatedSignature = `sha256=${hmac}`;
    console.warn({ signature, generatedSignature })
    const isAuthorized = crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature));
    return isAuthorized;
  }

  /**
   * Triggers a CRC request to be sent to the defined webhook subscription route
   * @param {string} webhookId 
   * @returns {Promise}
   */
  static async triggerCRC(webhookId) {
    return await this.userActivityHook.triggerCRC({ webhookId });
  }

  /**
   * Attempts to register a Webhook with Twitters API
   * @returns {Promise}
   */
  static async registerWebhook() {
    return await this.userActivityHook.register();
  }

  /**
   * Un-registers a Webhook with Twitter and deletes it from the database
   * @param {string} id - Twitter Webhook ID 
   * @returns {Promise}
   */
  static async unregister(twitter_webhook_id) {
    await this.userActivityHook.unregister(twitter_webhook_id);
    return await this.deleteByTwitterID(twitter_webhook_id)
  }

  /**
   * Get a list of all Webhooks for the current environment
   * @returns {Promise}
   */
  static async getWebhooksFromTwitter() {
    return await this.userActivityHook.getWebhook();
  }

  static async getWebhooks() {
    return await WebhookModel.getAll();
  }

  /**
   * Checks if a given Webhook is currently saved in the database and saves it if not
   * @param {Object} webhook - A Webhook Object 
   */
  static async verifyAndUpdate(webhook) {
    try {
      const { twitter_webhook_id } = webhook
      const webhookExists = await WebhookModel.exists(twitter_webhook_id);
      if (webhookExists) {
        const savedWebhook = await WebhookModel.getByTwitterID(twitter_webhook_id);
        if (!isEqual(webhook, savedWebhook)) {
          console.warn(`[ ✅  ] Webhook with ID: ${twitter_webhook_id} is out of date; Updating now!`);
          const updatedWebhook = await WebhookModel.updateByTwitterID(twitter_webhook_id, webhook);
          delete updatedWebhook.id;
          return updatedWebhook;
        } else {
          console.warn(`[ ❌  ] Webhook with ID: ${twitter_webhook_id} already exists in the database; No Changes made.`);
        }
      } else {
        const savedWebhook = await this.create(webhook)
        console.warn(`[ ✅  ] Webhook with ID: ${savedWebhook.twitter_webhook_id} has been registered in the database`)
        delete savedWebhook.id;
        return savedWebhook;
      }
    } catch (err) {
      return err
    }
  }

  /**
   * Checks against Twitters API to see if a given user is subscribed to the current environment subscription route
   * @param {{userId: string, accessToken: string, accessTokenSecret: string}} params - Formatted Credentials Object
   */
  static async isSubscribed({ userId, accessToken, accessTokenSecret }) {
    return await this.userActivityHook.isSubscribed({ userId, accessToken, accessTokenSecret });
  }

  /**
   * Subscribes a user to the currently defined subscription route
   * @param {{userId: string, accessToken: string, accessTokenSecret: string}} params - Formatted Credentials Object
   */
  static async subscribeUser({ userId, accessToken, accessTokenSecret }) {
    if (userId && accessToken && accessTokenSecret) {
      const isSubscribed = await this.isSubscribed({ userId, accessToken, accessTokenSecret });

      if (isSubscribed) {
        const updatedUser = await UserModel.updateByTwitterID(userId, { isSubscribed: true });
        delete updatedUser.id;
        return updatedUser;
      } else {
        await this.userActivityHook.subscribe({ userId, accessToken, accessTokenSecret });
        const updatedUser = await UserModel.updateByTwitterID(userId, { isSubscribed: true });
        delete updatedUser.id;
        return updatedUser;
      }
    }
    throw new Error('Credentials Not Provided');
  }

  /**
   * Saves a Webhook to the database
   * @param {Object} webhook - A Webhook Object
   */
  static async create(webhook) {
    const { environment: environment_name } = config.twitter;
    const formattedWebhook = { ...webhook, environment_name };
    const hasTwitterId = formattedWebhook.hasOwnProperty('twitter_webhook_id');
    const hasId = formattedWebhook.hasOwnProperty('id');

    if (hasId && hasTwitterId) {
      delete formattedWebhook.id;
    }

    if (hasId && !hasTwitterId) {
      renameProperty(formattedWebhook, 'id', 'twitter_webhook_id')
    }

    if (formattedWebhook.twitter_webhook_id) {
      const savedWebhook = await WebhookModel.create(formattedWebhook);
      delete savedWebhook.id;
      return savedWebhook;
    }

    throw new Error('Invalid Webhook Format');
  }

  static async createMany(webhooks) {
    const createdWebhooks = await pmap(webhooks, async (webhook) => {
      return await this.create(webhook);
    }, { concurrency: 500, stopOnError: true });
    return createdWebhooks;
  }

  static async getByTwitterID(twitter_webhook_id) {
    if (twitter_webhook_id) {
      const [foundWebhook] = await WebhookModel.getByTwitterID(twitter_webhook_id);
      delete foundWebhook.id
      return foundWebhook;
    }

    throw new Error('Twitter Webhook ID not provided');
  }

  /**
   * Deletes a Webhook from the database
   * @param {string} twitter_webhook_id - A Webhooks Twitter ID
   */
  static async deleteByTwitterID(twitter_webhook_id) {
    try {
      return await WebhookModel.deleteByTwitterID(twitter_webhook_id)
    } catch (err) {
      return err;
    }
  }
}
