// Modules
import { Router } from 'express'

// Routes
import v1 from './routes'

/**
 * Sets version one of routes to /api/v1
 */
const router = Router()
router.use(`/v1`, v1)

export default router
