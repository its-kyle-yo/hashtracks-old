import { Factory } from 'rosie';
import faker from 'faker';

export default (env) => {
  return new Factory()
    .sequence('twitter_webhook_id', id => parseInt(id).toString())
    .attr('url', faker.internet.url())
    .attr('valid', true)
    .attr('created_timestamp', new Date().getTime().toString())
    .attr('environment_name', env)
}