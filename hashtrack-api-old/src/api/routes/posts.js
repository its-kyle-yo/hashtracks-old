import { Router } from 'express';
import status from 'http-status-codes';

const posts = Router();

// User facing endpoints from client
// All creation relation requests come via POST /webhooks/subscriptions
posts.route('/:id')
  .get((req, res) => { res.status(status.OK).send(req.params.id) })
  .patch((req, res) => { res.status(status.OK).send(req.params.id) })
  .delete((req, res) => { res.status(status.OK).send(req.params.id) })
export default posts;