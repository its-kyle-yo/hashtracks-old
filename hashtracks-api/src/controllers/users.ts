// Modules
import status from 'http-status-codes'

// Services
import { UsersService } from '@services'

// Helpers
import { deepLogObject, CUSTOM_ERRORS } from '@helpers'

// Types
import { Response, Request, NextFunction } from 'express'
import { User } from '@prisma/client'

/**
 * Used to route /users request to the correct services and bridges
 */
export class UsersController {
  /**
   * Login is a catchall for a users initial request for interaction with the application
   * TODO: Split this function into separate login/register methods
   * @param req
   * @param res
   */
  async login(req: Request, res: Response, handleError: NextFunction) {
    try {
      // 1. Check if a user exist
      const { user } = req.body
      deepLogObject(user, `User for Login`)
      const userExists = await UsersService.exists(user.id.toString())
      if (userExists) {
        // 2a. If a user exists return the user and related initial content
        const returnedUser = await UsersService.login(user.id.toString())
        return res.status(status.OK).json(returnedUser)
      }
      // 2b. If a user is not found in the database attempt to verify and register the user
      const authHeader = req.headers[`x-twitter-auth`]?.toString()
      if (authHeader && user?.id) {
        const credentials = JSON.parse(authHeader)
        const registeredUser = await UsersService.register(user, credentials)
        return res.status(status.CREATED).json(registeredUser)
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * @param req
   * @param res
   * @param handleError
   */
  async findOne(req: Request, res: Response, handleError: NextFunction): Promise<Response<{ user: User }> | undefined> {
    try {
      const { id } = req.params
      if (id) {
        const foundUser = await UsersService.findOne(id)
        return res.status(status.OK).json(foundUser)
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      if (!err.stack) {
        err.stack = new Error().stack
      }
      handleError({ ...err, _error: err })
    }
  }

  /**
   * @param req
   * @param res
   * @param handleError
   */
  async update(req: Request, res: Response, handleError: NextFunction): Promise<Response<{ user: User }> | undefined> {
    try {
      const { id } = req.params
      const { data } = req.body

      if (!!id && !!data) {
        const updatedUser = await UsersService.update(id, data)
        return res.status(status.OK).json(updatedUser)
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      handleError({ ...err, _error: err })
    }
  }

  /**
   * @param req
   * @param res
   * @param handleError
   */
  async delete(req: Request, res: Response, handleError: NextFunction): Promise<Response<{ id: string, removed: any }> | undefined> {
    try {
      const { id } = req.params
      if (id) {
        const deletedUser = await UsersService.delete(id)
        return res.status(status.OK).send({ id, removed: deletedUser })
      }

      throw CUSTOM_ERRORS.BAD_REQUEST
    } catch (err) {
      handleError({ ...err, _error: err })
    }
  }
}

export default new UsersController()
