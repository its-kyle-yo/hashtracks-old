"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = void 0;

var _rosie = require("rosie");

var _faker = _interopRequireDefault(require("faker"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _default = function _default(env) {
  return new _rosie.Factory().sequence('twitter_webhook_id', function (id) {
    return parseInt(id).toString();
  }).attr('url', _faker["default"].internet.url()).attr('valid', true).attr('created_timestamp', new Date().getTime().toString()).attr('environment_name', env);
};

exports["default"] = _default;