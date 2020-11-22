// Modules
import { prisma } from '@root/server'

// Types
import { Webhook } from '@prisma/client'
import { FormattedWebhook, SearchCriteria } from 'CustomTypes'

/**
 * The Webhooks bridge is used primarily for internal interactions to update the status of
 * webhooks registered with Twitter
 */
export class WebhooksBridge {
  /**
   * Creates and saves a webhook for internal uses once a webhook is registered
   * @param webhook
   */
  async create(webhook: FormattedWebhook): Promise<Webhook> {
    const createdWebhook = await prisma.webhook.create({
      data: {
        ...webhook,
      },
    })

    return createdWebhook
  }

  /**
   * Finds a webhook by a given Twitter Webhook ID
 * @param webhook
 */
  async findOne(webhook: FormattedWebhook): Promise<Webhook | null> {
    const foundWebhook = await prisma.webhook.findOne({
      where: {
        twitterWebhookID: webhook.twitterWebhookID,
      },
    })

    return foundWebhook
  }

  /**
   * Finds several Webhooks based on filter criteria
   * @param param0
   */
  async findMany({ filter, value }: SearchCriteria): Promise<Webhook[]> {
    const foundWebhooks = await prisma.webhook.findMany({
      where: {
        [filter]: value,
      },
    })

    return foundWebhooks
  }

  /**
   * Updates a webhooks data or creates one of not already defined
   * @param webhook
   */
  async upsert(webhook: FormattedWebhook): Promise<Webhook> {
    const savedWebhook = prisma.webhook.upsert({
      where: {
        twitterWebhookID: webhook.twitterWebhookID,
      },
      update: {
        ...webhook,
      },
      create: {
        ...webhook,
      },
    })

    return savedWebhook
  }

  /**
   * Directly updates a piece of data on an existing webhook
   * @param twitterWebhookID
   * @param data
   */
  async update(twitterWebhookID: string, data: FormattedWebhook): Promise<Webhook> {
    const updatedWebhook = await prisma.webhook.update({
      where: {
        twitterWebhookID,
      },
      data,
    })

    return updatedWebhook
  }
}

export default new WebhooksBridge()
