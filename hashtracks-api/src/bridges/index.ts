import WebhooksBridge from './webhook'
import PostsBridge from './post'
import UsersBridge from './user'

/**
 * Bridges are the layer of interaction between services and Prisma
 * with Prisma being the middleman and direct interaction to our database
 */
export {
  WebhooksBridge,
  PostsBridge,
  UsersBridge,
}
