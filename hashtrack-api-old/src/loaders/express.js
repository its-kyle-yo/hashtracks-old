import redis from 'redis';
import session from 'express-session';
import bodyParser from 'body-parser';
import cors from 'cors';
import uuidv1 from 'uuid/v1';
import api from '@api';
import config from '@config';

export const rawBodySaver = function (req, _, buf, encoding) {
  if (buf && buf.length) {
    req.rawBody = buf.toString(encoding || 'utf8');
  }
}

export default async (app) => {
  const RedisStore = require('connect-redis')(session);
  let RedisClient = redis.createClient();

  RedisClient.on('error', console.error)
  app.use(cors());
  app.use(bodyParser.json({ verify: rawBodySaver }));
  app.use(
    session({
      secret: config.twitter.accessTokenSecret,
      name: '_hashtrackSession',
      genid() {
        return uuidv1() // use UUIDs for session IDs
      },
      store: new RedisStore({ client: RedisClient, ttl: 86400 }),
      resave: false,
      saveUninitialized: true,
      cookie: { secure: true }
    })
  )
  app.get('/status', (_, res) => { res.status(200).end(); });
  app.head('/status', (_, res) => { res.status(200).end(); });
  app.use('/api', api);
  return app;
}
