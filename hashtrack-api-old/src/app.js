import express from 'express';
import config from '@config';
import loaders from '@loaders';
import { WebhookService } from "@services/Webhook";

const startServer = async () => {
  try {
    const app = express();
    const tasks = await loaders(app);
    console.warn({ tasks })
    app.listen(config.port, async () => {
      console.warn(`[ 🚀  ] Server is live on: http://localhost:${config.port} (${config.node.env})`);
      // Tasks that need to be done after the server is live
      if (tasks.shouldRegisterWebhook) {
        console.warn(`[ ❔  ] Registering Webhook With Twitter 🐦`);
        const webhook = await WebhookService.registerWebhook();
        console.warn(`[ ❔  ] Saving Webhook with ID: ${webhook.id}`);
        await WebhookService.create({ ...webhook, twitter_webhook_id: webhook.id });
      }

      if (tasks.shouldTriggerCRC) {
        tasks.webhooks.forEach(async webhook => await WebhookService.triggerCRC(webhook.id))
      }
    });
  } catch (err) {
    console.error(err);
  }
}

startServer();