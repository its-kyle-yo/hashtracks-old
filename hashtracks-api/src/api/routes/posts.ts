// Modules
import { Router } from 'express'

// Controller
import { PostsController } from '@controllers'

const posts = Router()

posts.post(`/`, PostsController.createPost)
posts.route(`/:id`)
  .get(PostsController.findOne)
  .patch(PostsController.update)
  .delete(PostsController.deleteOne)

export default posts
