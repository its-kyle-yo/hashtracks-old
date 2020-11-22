import status from 'http-status-codes';
import { WebhookService } from "@services/Webhook";

export default (req, res, next) => {
  try {
    const { headers, rawBody } = req;
    console.warn({ headers, rawBody })
    if (!headers['x-twitter-webhooks-signature'] || !rawBody) {
      console.error('Rejecting from header and body not existing')
      throw new Error('Cannot Process Request')
    }
    const isAuthorized = WebhookService.compareSignatures(headers['x-twitter-webhooks-signature'], rawBody);
    console.warn({ isAuthorized })
    if (isAuthorized) {
      return next();
    } else {
      throw new Error('Unauthorized');
    }
  } catch (err) {
    console.warn(`Rejected Because ${err}`)
    return res.status(status.UNAUTHORIZED).send(err.toString())
  }
}