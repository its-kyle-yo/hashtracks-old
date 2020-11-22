// Modules
import status from 'http-status-codes'

// Types
import { CustomClientErrors } from 'CustomTypes'

const errors: CustomClientErrors = {
  FORBIDDEN: {
    reason: `Forbidden`,
    status: status.FORBIDDEN,
    message: `User does not have permission to access this resource`,
    type: `client`,
  },

  INVALID_AUTH_HEADER: {
    reason: `Invalid Authorization Header`,
    status: status.UNAUTHORIZED,
    message: `Authorization header is invalid`,
    type: `client`,
  },

  LOGIN_REQUIRED: {
    reason: `Login Required`,
    status: status.UNAUTHORIZED,
    message: `User must be logged in to access this resource`,
    type: `client`,
  },

  MISSING_AUTH_HEADER: {
    reason: `Missing Authorization Header`,
    status: status.UNAUTHORIZED,
    message: `Authorization header is not present`,
    type: `client`,
  },

  NOT_FOUND: {
    reason: `Not Found`,
    status: status.NOT_FOUND,
    message: `That resource does not exist`,
    type: `client`,
  },

  BAD_REQUEST: {
    reason: `Missing Request Parameters`,
    status: status.BAD_REQUEST,
    message: `One or more values are missing or incorrect in your request`,
    type: `client`,
  },

  NOT_IMPLEMENTED: {
    reason: `Route Not Implemented`,
    status: status.NOT_IMPLEMENTED,
    message: `Oops! Looks like you found something that isn't quite finished yet`,
    type: `client`,
  },

  UNSUPPORTED_EVENT: {
    reason: `Event Type Not Supported`,
    status: status.ACCEPTED,
    message: `Request has been received`,
    type: `client`,
  },
}

export default errors
