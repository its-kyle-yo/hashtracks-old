import { WebhookService } from "@services/Webhook";

export default async (app) => {
  try {
    let tasks = {
      shouldRegisterWebhook: true,
      shouldTriggerCRC: false,
      webhooks: []
    }
    // Setup Twitter hooks
    await WebhookService.initialize(app);
    // Check if there are webhooks already for the current environment
    const webhooks = await WebhookService.getWebhooksFromTwitter();
    if (webhooks.length) {
      for (let index = 0; index < webhooks.length; index++) {
        const webhook = webhooks[index];
        console.warn({ webhook });
        if (webhook.valid) {
          console.warn(`[ ❔  ] Checking Webhook with ID: ${webhook.id}`);
          await WebhookService.verifyAndUpdate({ ...webhook, twitter_webhook_id: webhook.id });
        } else {
          tasks.shouldTriggerCRC = true;
          tasks.webhooks.push(webhook.id)
        }
      }
      tasks.shouldRegisterWebhook = false;
    }
    // }
    return tasks;
  } catch (err) {
    console.error(err);
  }
}