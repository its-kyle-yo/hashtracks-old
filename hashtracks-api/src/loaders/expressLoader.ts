/* eslint-disable global-require */
// Modules
import redis from 'redis'

// Middleware
import morgan from 'morgan'
import session from 'express-session'
import bodyParser from 'body-parser'
import cors from 'cors'
import cuid from 'cuid'
import { handleErrors } from '@middleware'

// API Routes
import api from '@api'

// Helpers
import { convertToUTF8 } from '@helpers'

// Types
import { Application } from 'express'

// Config
import config from '@config'

/**
 * Loads all middleware and routes for the server to user
 * @param app
 */
const LoadExpress = async (app: Application): Promise<void> => {
  // The Twitter access token secret is used to sign the session ID cookie
  const { accessTokenSecret } = config.twitter
  // Redis is used to store all session transactions
  const RedisStore = require(`connect-redis`)(session)
  const RedisClient = redis.createClient({ url: config.redis.url })
  RedisClient.on(`error`, console.error)
  // Apply middleware
  app.use(morgan(`dev`))
  app.use(cors())
  // Used to apply rawBody to the request object for signature verification
  app.use(bodyParser.json({ verify: convertToUTF8 }))
  app.use(
    session({
      secret: <string>accessTokenSecret,
      name: `_hashtrackSession`,
      genid() {
        return cuid()
      },
      store: new RedisStore({ client: RedisClient, ttl: 86400 }),
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }, // TODO: Look into enabling the frontend to be HTTPS see: {https://www.npmjs.com/package/express-session}
    }),
  )
  // Used for heartbeat
  app.get(`/status`, (_, res) => { res.status(200).end() })
  app.head(`/status`, (_, res) => { res.status(200).end() })
  // Apply all routes to start at /api
  app.use(`/api`, api)
  // Default 404 handler
  app.use((req, res, _) => res.status(404).send({ method: req.method, error: `Route ${req.url} Not found.` }))
  // Error handling middleware must go last in the stack
  app.use(handleErrors)
}

export default LoadExpress
