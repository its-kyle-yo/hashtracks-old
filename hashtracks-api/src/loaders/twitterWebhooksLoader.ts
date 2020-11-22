// Services
import { WebhooksService } from '@services'

// Types
import { Express } from 'express'
import { Tasks } from 'CustomTypes'

// Config
import config from '@config'

/**
 * Loads and registers the server for subscriptions if needed
 */
const LoadTwitterWebhooks = async (app: Express): Promise<Tasks> => {
  try {
    const { serverUrl, route } = config.twitter
    const currentEnvSubRoute = `${serverUrl}${route}` // Using template to force empty string if undefined
    const tasks: Tasks = {
      shouldRegisterWebhook: true,
      shouldTriggerCRC: false,
      webhookIDs: [],
    }

    // Setup twitter-webhooks package
    WebhooksService.initialize(app)

    const webhooks = await WebhooksService.getRegisteredWebhooks()
    // If there are any registered webhooks to this server and environment we do
    // not need to send a registration request
    if (webhooks.length) {
      for await (const webhook of webhooks) {
        // If the webhook is not valid and is for this env according to Twitter we will need it to be fixed
        if (webhook.valid && Object.is(webhook.url, currentEnvSubRoute)) {
          // Check for any changes in the given webhook
          await WebhooksService.verify(webhook)
        } else {
          tasks.shouldTriggerCRC = true
          tasks.webhookIDs.push(webhook.id)
        }
      }
      tasks.shouldRegisterWebhook = false
    }

    return tasks
  } catch (err) {
    throw new Error(err)
  }
}

export default LoadTwitterWebhooks
