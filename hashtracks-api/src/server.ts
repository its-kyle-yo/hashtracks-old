// For compiled path aliases - Can be edited in package.json
import 'module-alias/register'

// Modules
import { PrismaClient } from '@prisma/client'
import express from 'express'

// Helpers
import { deepLogObject } from '@helpers'

// Loaders
import load from './loaders'

// Config
import config from './config'

// Services
import { WebhooksService } from './services'


/**
 * Creates a connection to the database and exports it allowing
 * any bridge or otherwise the ability to make calls via Prisma
 */
export const prisma = new PrismaClient({ errorFormat: `pretty`, _internal: { debug: config.prisma.debug } })

/**
 * Loads all necessary middleware and routes before initiating any necessary startup tasks
 */
const startServer = async () => {
  try {
    // 1. Create a new express server
    const app = express()
    // 2. Initiate all Loaders gathering any tasks they discover
    const tasks = await load(app)
    // 3. Start the server
    app.listen(config.port, async () => {
      console.warn(`[ 🚀  ] Server is live on: http://localhost:${config.port} (${config.node.env})`)
      // 4. Run any tasks that need to be done after the server is live
      deepLogObject(tasks, `Tasks`)
      if (tasks.shouldRegisterWebhook) {
        console.warn(`[ ❔  ] Registering Webhook With Twitter 🐦`)
        const webhook = await WebhooksService.registerWebhook()
        console.warn(`[ ❔  ] Saving Webhook with ID: ${webhook.id}`)
        const savedWebhook = await WebhooksService.create(webhook)
        deepLogObject(savedWebhook, `Saved Webhook:`)
      }

      if (tasks.shouldTriggerCRC && tasks.webhookIDs.length) {
        const triggeredCRCPromises = tasks.webhookIDs.map(async (id) => WebhooksService.triggerCRC(id))
        const resolvedTriggers = await Promise.all(triggeredCRCPromises)
        deepLogObject(resolvedTriggers)
      }
    })
  } catch (err) {
    console.error(err)
  }
}

startServer()
