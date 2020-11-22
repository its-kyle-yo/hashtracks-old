
// Helpers
import { CUSTOM_ERRORS } from '@helpers'
// Types
import { Request, NextFunction, Response } from 'express'

const SUPPORTED_TWITTER_EVENTS = {
  CREATE: `tweet_create_events`,
  DELETE: `tweet_delete_events`,
  USER_REMOVED: `user_event`,
  CRC_TOKEN: `crc_token`,
}

/**
 * Gracefully rejects a request from twitter if we do not wish to process it
 * NOTE: We currently support delete and user_removed to remain in compliance with Twitter EULA
 * @param req
 * @param res
 * @param next
 */
const rejectUnsupportedEvents = (req: Request, _: Response, next: NextFunction) => {
  const handleError = next
  try {
    // 1. Grabs all body and query properties and combines them
    const bodyElements = Object.keys(req.body)
    const queryParams = Object.keys(req.query)
    const events = bodyElements.concat(queryParams)

    // 2. Checks all properties to see if our supported events are available
    let eventType = ``
    const isSupported = events.some((event) => {
      eventType = event
      return Object.values(SUPPORTED_TWITTER_EVENTS).includes(event)
    })

    // 3. If the event is supported then we apply the type to the request for later use down the line
    if (isSupported) {
      req.subscriptionEventType = eventType
      return next()
    }

    throw CUSTOM_ERRORS.UNSUPPORTED_EVENT
  } catch (err) {
    if (!err.stack) {
      err.stack = new Error().stack
    }
    handleError({ ...err, _error: err })
  }
}

export default rejectUnsupportedEvents
