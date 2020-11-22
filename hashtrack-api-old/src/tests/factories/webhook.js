import { Factory } from 'rosie';
import faker from 'faker';
import config from '@config';

export default (chance) => {
  return new Factory()
    .sequence('twitter_webhook_id', id => parseInt(id).toString())
    .attr('url', faker.internet.url())
    .attr('valid', true)
    .attr('created_timestamp', new Date().getTime().toString())
    .attr('environment_name', config.twitter.environment)
}