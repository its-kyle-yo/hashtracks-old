// Modules
import { Router } from 'express'

// Middleware
import { compareSignatures } from '@middleware'

// Controllers
import { WebhooksController } from '@controllers'

const webhooks = Router()
webhooks.route(`/subscriptions`)
  .get(WebhooksController.respondWithCrc)
  .post(compareSignatures, WebhooksController.handleTwitterEvents)

export default webhooks
