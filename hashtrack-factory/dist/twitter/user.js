"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _faker = _interopRequireDefault(require("faker"));

var _rosie = require("rosie");

var _entities = require("./entities");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = function _default() {
  return new _rosie.Factory().sequence('id').attr('id_str', ['id'], function (id) {
    return id.toString();
  }).attr('name', _faker["default"].name.findName()).attr('screen_name', _faker["default"].internet.userName()).attr('location').attr('url', _faker["default"].internet.url()).attr('description', _faker["default"].lorem.sentence()).attr('entities', (0, _entities.Entities)().build()).attr('protected', false).attr('verified', false).attr('followers_count', _faker["default"].random.number()).attr('friends_count', _faker["default"].random.number()).attr('listed_count', _faker["default"].random.number()).attr('favourites_count', _faker["default"].random.number()).attr('statuses_count', _faker["default"].random.number()).attr('created_at', _faker["default"].date.past()).attr('profile_banner_url', _faker["default"].image.image()).attr('profile_image_url_https', ['profile_image_url'], function (url) {
    return url;
  }).attr('default_profile', false).attr('default_profile_image', false) // All attributes beyond this point are deprecated but still available on the users object and will be set to null
  .attr('utc_offset', null).attr('time_zone', null).attr('geo_enabled', null).attr('lang', null).attr('contributors_enabled', null).attr('is_translator', null).attr('is_translation_enabled', null).attr('profile_background_color', null).attr('profile_background_image_url', null).attr('profile_background_image_url_https', null).attr('profile_background_tile', null).attr('profile_image_url', null).attr('profile_link_color', null).attr('profile_sidebar_border_color', null).attr('profile_sidebar_fill_color', null).attr('profile_text_color', null).attr('profile_use_background_image', true).attr('has_extended_profile', false).attr('following', null).attr('follow_request_sent', false).attr('notifications', true);
};

exports["default"] = _default;