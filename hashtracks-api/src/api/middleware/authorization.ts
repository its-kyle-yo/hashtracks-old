// Config
import config from '@config'

// Helpers
import { verifyTwitterUser, CUSTOM_ERRORS } from '@helpers'

// Types
import { Request, Response, NextFunction } from 'express'


/**
 * Checks if a user has been verified previously.
 * Otherwise verifies a user against Twitters API and updates the session.
 * @param req
 * @param res
 * @param next
 */
const authorization = async (req: Request, _: Response, next: NextFunction): Promise<NextFunction | void> => {
  // Handle Error is defined to be more descriptive of its purpose when used
  const handleError = next
  try {
    // Skips auth if in dev mode
    if (config.node.env === `development`) {
      return next()
    }

    // If the cookie shows as already logged in move on
    if (req!.session!.isLoggedIn) {
      return next()
    }

    // Set the session to logged out if a request comes in
    // without the auth-header
    if (!req.headers[`x-twitter-auth`]) {
      req!.session!.isLoggedIn = false
      throw CUSTOM_ERRORS.MISSING_AUTH_HEADER
    }

    // Attempt to verify the user via Twitter API
    const { accessToken, secret, id } = JSON.parse(<string>req.headers[`x-twitter-auth`])
    const isVerified = await verifyTwitterUser({ accessToken, secret }, id)

    req!.session!.isLoggedIn = isVerified

    if (isVerified) {
      return next()
    }

    throw CUSTOM_ERRORS.FORBIDDEN
  } catch (err) {
    if (!err.stack) {
      err.stack = new Error().stack
    }
    handleError({ ...err, _error: err })
  }
}

export default authorization
