import { Router } from 'express';
import compareSignatures from '../middleware/compareSignatures';
import { handleTwitterEvents, respondWithCrc } from '@controllers/Webhooks';

const webhooks = Router();

webhooks.route('/subscriptions')
  .get(respondWithCrc)
  .post(compareSignatures, handleTwitterEvents)

export default webhooks;