// Modules
import status from 'http-status-codes'

// Types
import {
  ErrorRequestHandler, Response, NextFunction, Request,
} from 'express-serve-static-core'
import { ClientFacingError, GeneratedError } from 'CustomTypes'

// NOTE: For handle errors to work as an error handling middleware it must go at the end of the middleware stack.
// Being the final call of app.use() for middleware.
/**
 * Handle Errors is the middleware to handle all errors thrown from every part of the application
 * @param err
 * @param req
 * @param res
 * @param _
 */
const handleErrors: ErrorRequestHandler = (err, req: Request, res: Response, _: NextFunction): Response<ClientFacingError> => {
  // User to separate what is the original error and what we are creating.
  const generatedError: GeneratedError = err
  const timestamp = new Date().getTime()

  // A status code may not exist on a returned error e.g. a system error
  if (!err.status) {
    generatedError.status = status.INTERNAL_SERVER_ERROR
  }

  // If an error is not a custom error from @root/helpers/errors a type will not be provided
  if (!err.type) {
    generatedError.type = `system`
  }

  // Default messages and reasons for internal errors
  if (!err.message) {
    generatedError.reason = `Oops! Somethings not right here...`
    generatedError.message = `Looks like something broke. Check the logs! 🛠️`
  }

  // Adds internal meta info to be displayed and saved to the logs
  const withMeta = {
    method: req.method, // [GET, PATCH, POST, DELETE, etc...]
    path: req.path, // api/v1/<route>
    query: req.query, // All query params defined
    params: req.params, // All params from express for routes defined with /:param
    body: req.body, // Request body
    stack: err.stack, // Details of where/how the error occurred
    code: err.code, // HTTP Status codes or system codes
    timestamp,
    ...generatedError,
  }

  console.group()
  console.error(`[ 💻 ❌ ] Error Log: `)
  console.error({ ...withMeta })
  console.groupEnd()

  return res.status(generatedError.status).json({
    error: generatedError.reason,
    message: generatedError.message,
    timestamp,
  })
}

export default handleErrors
