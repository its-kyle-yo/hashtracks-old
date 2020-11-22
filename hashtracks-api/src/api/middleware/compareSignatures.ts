// Services
import { WebhooksService } from '@services'

// Helpers
import { CUSTOM_ERRORS, deepLogObject } from '@helpers'

// Types
import {
  NextFunction, Response, Request, RequestHandler,
} from 'express'

/**
 * Validates a signed Twitter Event as coming from Twitter
 * @param req
 * @param _
 * @param next
 */
const compareSignatures: RequestHandler = (req: Request, _: Response, next: NextFunction): void | NextFunction => {
  const handleError = next
  try {
    // NOTE: rawBody is required here as it is a string of the body converted to UTF-8 for digestion and conversion into a CRC Token
    const { headers, rawBody } = req
    deepLogObject(headers, `Headers`)
    deepLogObject({ rawBody }, `Raw Body`)

    if (!headers[`x-twitter-webhooks-signature`] || !rawBody) {
      throw CUSTOM_ERRORS.MISSING_AUTH_HEADER
    }

    const isAuthorized = WebhooksService.compareSignatures(<string>headers[`x-twitter-webhooks-signature`], rawBody)
    if (isAuthorized) {
      return next()
    }
    throw CUSTOM_ERRORS.INVALID_AUTH_HEADER
  } catch (err) {
    if (!err.stack) {
      err.stack = new Error().stack
    }
    handleError({ ...err, _error: err })
  }
}

export default compareSignatures
