// Modules
import { Express } from 'express'

// Types
import { Tasks } from 'CustomTypes'

// Loaders
import LoadExpress from './expressLoader'
import LoadTwitterWebhooks from './twitterWebhooksLoader'


/**
 * Gathers all loaders and runs them passing in the express app for any related needs
 * @param app
 */
const load = async (app: Express): Promise<Tasks> => {
  try {
    await LoadExpress(app)
    console.warn(`[ 🚀  ] Express: Loaded`)
    // Currently on the Twitter Webhooks loader has any tasks that may need to be run
    // once the server is up and running
    const tasks = await LoadTwitterWebhooks(app)
    console.warn(`[ 🚀  ] Twitter Webhooks: Loaded`)
    return tasks
  } catch (err) {
    throw new Error(err)
  }
}

export default load
