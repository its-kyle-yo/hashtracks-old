import expressLoader from './express';
import twitterWebhooksLoader from './twitterwebhooks';

export default async (app) => {
  try {
    await expressLoader(app);
    console.warn('[ 🚀  ] Express: Loaded');
    const tasks = await twitterWebhooksLoader(app);
    console.warn('[ 🚀  ] Twitter Webhooks: Loaded');
    return tasks
  } catch (err) {
    console.error(err);
  }
}