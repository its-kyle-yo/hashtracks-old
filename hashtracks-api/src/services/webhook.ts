// Modules
import crypto from 'crypto'
import { to } from 'await-to-js'
import { isEqual } from 'lodash'

// Bridges
import { WebhooksBridge } from '@bridges'

// Helpers
import { deepLogObject } from '@helpers'

// Config
import config from '@config'

// Types
import { Application } from 'express'
import { Webhook } from '@prisma/client'
import { userActivity, TwitterWebhook } from 'twitter-webhooks'
import { FormattedWebhook, FormattedCredentials } from 'CustomTypes'

export class WebhooksService {
  /**
   * Used for all interactions between the services and the twitter-webhooks package
   */
  twitterInterface: any

  /**
   * Initialize the twitter-webhooks package
   * @param app
   */
  initialize(app: Application) {
    const { twitter } = config
    this.twitterInterface = userActivity({
      serverUrl: twitter.serverUrl,
      route: twitter.route,
      consumerKey: twitter.consumerKey,
      consumerSecret: twitter.consumerSecret,
      accessToken: twitter.accessToken,
      accessTokenSecret: twitter.accessTokenSecret,
      environment: twitter.environment,
      appBearerToken: twitter.appBearerToken,
      app,
    })
  }

  /**
   * Generates a CRC response based on the token provided from Twitter
   * @param crcToken
   */
  async generateCRC(crcToken: string): Promise<string> {
    const { consumerSecret } = config.twitter
    const hmac = crypto
      .createHmac(`sha256`, <string>consumerSecret)
      .update(crcToken)
      .digest(`base64`)
    return `sha256=${hmac}`
  }

  /**
   * Compares a signature given with each webhook interaction from Twitters API
   * based on the UTF-8 string version of the body of the request
   * @param signature
   * @param body
   */
  compareSignatures(signature: string, body: string): boolean {
    const { twitter } = config
    const hmac = crypto
      .createHmac(`sha256`, <string>twitter.consumerSecret)
      .update(body)
      .digest(`base64`)
    const generatedSignature = `sha256=${hmac}`
    console.warn({ signature, generatedSignature })
    const isAuthorized = crypto.timingSafeEqual(Buffer.from(generatedSignature), Buffer.from(signature))
    return isAuthorized
  }

  /**
   * Requests all the webhooks currently registered to the environment defined
   * via the config params in this.initialize
   */
  getRegisteredWebhooks(): Promise<TwitterWebhook[]> {
    // WARNING: This will be updated in the future to only return one webhook.
    // Currently due to a bug in the package it will return an array of all of them
    // see {https://github.com/super-ienien/twitter-webhooks#getwebhook}
    return this.twitterInterface.getWebhook()
  }

  /**
   * Registers the given route in this.initialize with Twitter to serve
   * all subsequent user activity to for the application registered
   * with the API keys above
   */
  async registerWebhook(): Promise<TwitterWebhook> {
    return this.twitterInterface.register()
  }

  /**
   * Request that Twitter initiates a CRC Request to out registered route
   * in the case that a registered webhook has been invalidated for any reason
   * See: {https://developer.twitter.com/en/docs/accounts-and-users/subscribe-account-activity/guides/securing-webhooks}
   * @param webhookId
   */
  async triggerCRC(webhookId: string): Promise<TwitterWebhook> {
    try {
      return this.twitterInterface.triggerChallengeResponseCheck({ webhookId })
    } catch (err) {
      return err
    }
  }

  /**
   * Verifies that a Webhook that Twitter says is register for our app is saved to our database
   * and updates any necessary changes that have been made to the webhook
   * @param webhook
   */
  async verify(webhook: TwitterWebhook): Promise<Webhook> {
    console.warn(`[ ❔  ] Checking Webhook with ID: ${webhook.id}`)
    deepLogObject(webhook, `Webhook For Verification`)
    const formattedWebhook = this.formatWebhook(webhook)
    const exists = await this.exists(formattedWebhook)
    const updatedWebhook = await WebhooksBridge.upsert(formattedWebhook)
    if (exists) {
      if (this.isUpdated(formattedWebhook, updatedWebhook)) {
        console.warn(`[ ✅  ] : Webhook with ID: ${webhook.id} has been updated`)
        deepLogObject(formattedWebhook, `Original`)
        deepLogObject(updatedWebhook, `Updated`)
      } else {
        console.warn(`[ 👍  ] : Webhook with ID: ${webhook.id} has no changes`)
      }
    } else {
      console.warn(`[ ✅  ] : Webhook with ID: ${webhook.id} has been saved to the database 🎉`)
    }
    return updatedWebhook
  }

  /**
   * Saves a given webhook to our database
   * @param webhook
   */
  async create(webhook: TwitterWebhook): Promise<Webhook> {
    const formattedWebhook = this.formatWebhook(webhook)
    const createdWebhook = await WebhooksBridge.create(formattedWebhook)
    return createdWebhook
  }

  /**
  * Attempts to find a Webhook. Checks one exists and has an ID from the database (which is auto-generated on creation)
  * @param twitterUserID
  */
  async exists(webhook: FormattedWebhook): Promise<boolean> {
    const foundWebhook = await WebhooksBridge.findOne(webhook)

    return !!foundWebhook?.id
  }

  /**
   * Formats a webhook returned from the twitter-webhooks package
   * into a useable format for our database
   * @param webhook
   */
  formatWebhook(webhook: TwitterWebhook): FormattedWebhook {
    const {
      id, created_timestamp, url, valid,
    } = webhook
    const formattedWebhook: FormattedWebhook = {
      url,
      valid,
      twitterWebhookID: id,
      createdAt: new Date(created_timestamp).toISOString(),
      environment: <string>config.twitter.environment,
    }
    return formattedWebhook
  }

  // TODO: Only used for checking "upserted" webhooks. Could be abstracted into a helper
  /**
   * Checks if a given Webhook has had any changes made to it since we
   * are using upsert in this.verify which can choose to create a webhook
   * or update an existing one if any
   * @param obj1
   * @param obj2
   */
  isUpdated(obj1: any, obj2: any): boolean {
    // 1. Takes all the values of the first object and pastes in the ID of the second (since that is static)
    const testObject = { ...obj1, id: obj2.id }
    return !isEqual(testObject, obj2)
  }

  /**
   * Allows us to abstract away if the subscription to a webhook was successful rather
   * than returning and utilizing the event emitter return from the twitter-webhooks package
   * @param userId
   * @param credentials
   */
  async subscribeProxy(userId: string, credentials: FormattedCredentials) {
    /** Since to() returns an array [error, resultOfCall] we only care about
     * grabbing the error (if any) to use for our purposes while controlling
     * the flow of our subscription status
     */
    const [subscriptionError] = await to(this.twitterInterface.subscribe({ userId, ...credentials }))
    if (subscriptionError) {
      return [subscriptionError, false]
    }

    return [subscriptionError, true]
  }

  /**
   * Checks if our webhook, server and route have been successfully subscribed to a users account activity
   * @param userId
   * @param credentials
   */
  async checkSubscriptionStatus(userId: string, credentials: FormattedCredentials) {
    const subscriptionStatus = await this.twitterInterface.isSubscribed({ userId, ...credentials })
    deepLogObject({ subscriptionStatus }, `Subscription Status`)
    return subscriptionStatus
  }

  /**
   * Attempts to subscribe our application to a given users account activity
   * @param userId
   * @param credentials
   */
  async subscribeToWebhook(userId: string, credentials: FormattedCredentials) {
    const isSubscribed = await this.checkSubscriptionStatus(userId, credentials)
    if (isSubscribed) {
      return { subscriptionSuccessful: isSubscribed }
    }

    const [subscriptionError, subscriptionSuccessful] = await this.subscribeProxy(userId, credentials)

    if (subscriptionError) {
      throw subscriptionError
    }

    return { subscriptionSuccessful }
  }
}

export default new WebhooksService()
