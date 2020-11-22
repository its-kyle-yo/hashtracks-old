import { Factory } from 'rosie';
import faker from 'faker';

export default () => {
  return new Factory()
    .sequence('twitter_user_id', (id) => {
      return id.toString();
    })
    .attr('twitter_handle', () => {
      return (`@${faker.internet.userName()}`)
    })
    .attr('isSubscribed', false)
    .attr('isNewUser', true)
    .attr('profile_image_url', faker.image.imageUrl())
    .attr('name', faker.name.firstName())
    .attr('commitments', []);
}