// Modules
import { Router } from 'express'

// Middleware
import { rejectUnsupportedEvents, authorization } from '@middleware'

// Routes
import webhooks from './webhooks'
import users from './users'
import posts from './posts'


/**
 * Version 1.0.0 of the API
 */
const v1 = Router()

v1.use(`/webhooks`, rejectUnsupportedEvents, webhooks)
v1.use(`/users`, authorization, users)
v1.use(`/posts`, authorization, posts)

export default v1
