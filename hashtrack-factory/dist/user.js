"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _rosie = require("rosie");

var _faker = _interopRequireDefault(require("faker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = function _default() {
  return new _rosie.Factory().sequence('twitter_user_id', function (id) {
    return id.toString();
  }).attr('twitter_handle', function () {
    return "@".concat(_faker["default"].internet.userName());
  }).attr('isSubscribed', false).attr('isNewUser', true).attr('profile_image_url', _faker["default"].image.imageUrl()).attr('name', _faker["default"].name.firstName()).attr('commitments', []);
};

exports["default"] = _default;