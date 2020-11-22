"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.media_types = void 0;

var _faker = _interopRequireDefault(require("faker"));

var _chance = require("chance");

var _rosie = require("rosie");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

var media_types = {
  GIF: 'animated_gif',
  PHOTO: 'photo',
  VIDEO: 'video'
}; // A factory for a formatted post

exports.media_types = media_types;

var _default = function _default() {
  return new _rosie.Factory().sequence('twitter_post_id', function (id) {
    return id.toString();
  }).attr('created_at', new Date()).attr('deconstructed_date', ['created_at'], function (created_at) {
    return {
      day: created_at.getDate(),
      month: created_at.getMonth(),
      year: created_at.getFullYear()
    };
  }).attr('text', _faker["default"].lorem.sentence()).attr('source', _faker["default"].internet.url()).option('hashtag_length', 10).attr('hashtags', ['hashtag_length'], function (hashtag_length) {
    return _toConsumableArray(Array(hashtag_length)).map(function () {
      return new _chance.Chance().hashtag();
    });
  }).option('text_with_url', false).option('media_type', media_types.PHOTO).attr('media', ['media_type'], function (media_type) {
    var media = [];

    switch (media_type) {
      case media_types.ANIMATED_GIF:
        media.push({
          image_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
          video_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
          type: media_types.ANIMATED_GIF
        });

      case media_types.VIDEO:
        media.push({
          image_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/200_s.gif",
          video_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/giphy.mp4",
          type: media_types.VIDEO
        });
        break;

      case media_types.PHOTO:
        media.push({
          image_url: _faker["default"].image.imageUrl(),
          video_url: null,
          type: media_types.PHOTO
        }, {
          image_url: _faker["default"].image.imageUrl(),
          video_url: null,
          type: media_types.PHOTO
        }, {
          image_url: _faker["default"].image.imageUrl(),
          video_url: null,
          type: media_types.PHOTO
        }, {
          image_url: _faker["default"].image.imageUrl(),
          video_url: null,
          type: media_types.PHOTO
        });
        break;
    }

    return media;
  }).after(function (post, options) {
    if (options.text_with_url) {
      post.text.concat(' ', _faker["default"].internet.imageUrl());
    }
  });
};

exports["default"] = _default;