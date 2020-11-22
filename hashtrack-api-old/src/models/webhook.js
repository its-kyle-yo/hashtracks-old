import { prisma } from "@prisma";
export class WebhookModel {
  // Create
  static async create(webhook) {
    const createdWebhook = await prisma.createWebhook({ ...webhook });
    delete createdWebhook.id;
    return createdWebhook;
  }

  // Read
  static async getByTwitterID(twitter_webhook_id) {
    return await prisma.webhooks({ where: { twitter_webhook_id } });
  }

  static async getAll() {
    return await prisma.webhooks();
  }

  // Update
  static async updateByTwitterID(twitter_webhook_id, data) {
    if (data.hasOwnProperty('twitter_webhook_id')) {
      console.log('Twitter Webhook ID Cannot Be Updated: Deleting Webhook ID from Object')
      delete data.twitter_webhook_id;
    }
    return await prisma.updateWebhook({
      where: { twitter_webhook_id },
      data
    });
  }
  // Delete

  static async deleteByTwitterID(twitter_webhook_id) {
    return await prisma.deleteWebhook({ twitter_webhook_id });
  }

  // Misc
  static async exists(twitter_webhook_id) {
    return await prisma.$exists.webhook({ twitter_webhook_id })
  }
}