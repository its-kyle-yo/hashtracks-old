import { Router } from 'express';
import webhooks from './routes/webhooks';
import users from './routes/users';
import posts from './routes/posts'
import authorization from './middleware/authorization';
import rejectUnsupportedEvents from './middleware/rejectUnsupportedEvents';

const v1 = Router();

v1.use('/webhooks', rejectUnsupportedEvents, webhooks);
v1.use('/users', authorization, users);
v1.use('/posts', authorization, posts)

export default v1