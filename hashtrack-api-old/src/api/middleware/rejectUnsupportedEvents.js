import status from "http-status-codes";

const SUPPORTED_TWITTER_EVENTS = {
  CREATE: 'tweet_create_events',
  DELETE: 'tweet_delete_events',
  USER_REMOVED: 'user_event',
  CRC_TOKEN: 'crc_token'
}

export default (req, res, next) => {
  const bodyElements = Object.keys(req.body);
  const queryParams = Object.keys(req.query);
  const events = bodyElements.concat(queryParams);
  let eventType = '';
  const isSupported = events.some(event => {
    eventType = event;
    return Object.values(SUPPORTED_TWITTER_EVENTS).includes(event)
  });
  if (isSupported) {
    req.subscriptionEventType = eventType;
    return next();
  }

  return res.status(status.OK).send('Request Received: Event Type Unsupported')
}


