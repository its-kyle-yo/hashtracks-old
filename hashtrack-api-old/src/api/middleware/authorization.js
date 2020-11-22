import status from 'http-status-codes';
import twitter from '@services/helpers/twitter';

export default async (req, res, next) => {
  try {
    if (!req.headers['x-twitter-auth']) {
      req.session.isLoggedIn = false;
      throw new Error('Unable to Verify Request');
    }

    if (!req.session.isLoggedIn) {
      const { accessToken, secret } = JSON.parse(req.headers['x-twitter-auth']);
      const isVerified = await twitter.verifyTwitterUser({ accessToken, secret });

      if (isVerified) {
        req.session.isLoggedIn = isVerified;
        return next();
      }

      req.session.isLoggedIn = isVerified;
      return res.status(status.FORBIDDEN).send('Not Authorized To Access This Resource');
    }

    return next();
  } catch (err) {
    return res.status(status.BAD_REQUEST).send(err);
  }
}