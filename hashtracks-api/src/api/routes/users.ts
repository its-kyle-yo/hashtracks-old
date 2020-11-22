// Modules
import { Router } from 'express'

// Controllers
import { UsersController } from '@controllers'

// Helpers
import { CUSTOM_ERRORS } from '@helpers'

/**
 * User Facing Only: These routes will only interact with the frontend
 */
const users = Router()

users.post(`/login`, UsersController.login)
users.route(`/:id`)
  .get(UsersController.findOne)
  .patch(UsersController.update)
  .delete(UsersController.delete)

// TODO: Implement commitments
users.route(`/:id/commitments`)
  .get(() => { throw CUSTOM_ERRORS.NOT_IMPLEMENTED })
  .delete(() => { throw CUSTOM_ERRORS.NOT_IMPLEMENTED })

users.route(`/:id/commitments/:commitment`)
  .get(() => { throw CUSTOM_ERRORS.NOT_IMPLEMENTED })
  .patch(() => { throw CUSTOM_ERRORS.NOT_IMPLEMENTED })
  .delete(() => { throw CUSTOM_ERRORS.NOT_IMPLEMENTED })

export default users
