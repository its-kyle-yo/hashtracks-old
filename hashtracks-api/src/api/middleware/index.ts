import authorization from './authorization'
import compareSignatures from './compareSignatures'
import rejectUnsupportedEvents from './rejectUnsupportedEvents'
import handleErrors from './handleErrors'

/**
 * Custom middleware defined to selectively control the flow of requests and data
 * through the server
 */
export {
  authorization,
  compareSignatures,
  rejectUnsupportedEvents,
  handleErrors,
}
