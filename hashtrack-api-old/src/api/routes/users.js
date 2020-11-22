import { Router } from 'express';
import status from 'http-status-codes';
import { UserService } from "@services/User";
import { PostService } from "@services/Post";

const users = Router();
const userLogin = async (req, res) => {
  try {
    const { user } = req.body;
    const credentials = JSON.parse(req.headers['x-twitter-auth']);
    const returnedUser = await UserService.login({ user, credentials });
    const posts = await PostService.getAll(returnedUser.id);
    const signedInUser = { ...returnedUser, ...posts }
    console.warn({ signedInUser });
    delete signedInUser.id;
    return res.status(signedInUser.isNewUser ? status.CREATED : status.OK).json(signedInUser);
  } catch (err) {
    console.error(err)
    return res.status(status.BAD_REQUEST).send(err.toString())
  }
}

const getAllPosts = async (req, res) => {
  const posts = await PostService.getAll(req.params.id)
  return res.status(status.OK).json(posts);
}

users.post('/login', userLogin)
users.route('/:id')
  .get((req, res) => { res.status(status.OK).send(req.params.id) })
  .patch((req, res) => { res.status(status.OK).send(req.params.id) })
  .delete((req, res) => { res.status(status.OK).send(req.params.id) })

users.get('/:id/posts', getAllPosts)

users.route('/:id/commitments')
  .get((req, res) => { res.status(status.OK).send(req.params.id) })
  .delete((req, res) => { res.status(status.OK).send(req.params.id) })

users.route('/:id/commitments/:commitment')
  .get((req, res) => { res.status(status.OK).send({ id: req.params.id, commitment: req.params.commitment }) })
  .patch((req, res) => { res.status(status.OK).send({ id: req.params.id, commitment: req.params.commitment }) })
  .delete((req, res) => { res.status(status.OK).send({ id: req.params.id, commitment: req.params.commitment }) })

export default users;