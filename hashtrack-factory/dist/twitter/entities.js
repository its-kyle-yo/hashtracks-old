"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.Entities = exports.ExtendedTweet = exports.ExtendedEntities = exports.Size = exports.Sizes = exports.MediaEntity = exports.UrlsEntity = exports.UserMentionsEntity = exports.media = void 0;

var _faker = _interopRequireDefault(require("faker"));

var _twitterText = _interopRequireDefault(require("twitter-text"));

var _chance = require("chance");

var _rosie = require("rosie");

var _tweet = require("./tweet");

var _post = require("../post");

var _media;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(Object(source), true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var media = (_media = {}, _defineProperty(_media, _post.media_types.GIF, {
  image_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif",
  video_url: "https://media.giphy.com/media/pVGsAWjzvXcZW4ZBTE/giphy.gif"
}), _defineProperty(_media, _post.media_types.VIDEO, {
  image_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/200_s.gif",
  video_url: "https://media.giphy.com/media/xWMPYx55WNhX136T0V/giphy.mp4"
}), _defineProperty(_media, _post.media_types.PHOTO, {
  image_url: _faker["default"].image.imageUrl(),
  video_url: null
}), _media);
exports.media = media;

var UserMentionsEntity = function UserMentionsEntity(mention, idOffset, user_id) {
  return new _rosie.Factory().attr('id', user_id + idOffset).attr('id_str', (user_id + idOffset).toString()).attr('screen_name', mention.screenName).attr('name', mention.screenName).attr('indices', mention.indices);
};

exports.UserMentionsEntity = UserMentionsEntity;

var UrlsEntity = function UrlsEntity(url, indices) {
  return new _rosie.Factory().attr('url', url).attr('expanded_url', url).attr('display_url', url).attr('indices', indices);
};

exports.UrlsEntity = UrlsEntity;

var MediaEntity = function MediaEntity(tweet_type, media_payload) {
  var url = media_payload.url,
      indices = media_payload.indices,
      status_id = media_payload.status_id;

  if (tweet_type !== _tweet.TWEET_TYPES.TEXT_ONLY) {
    return new _rosie.Factory().attr('display_url', url).attr('expanded_url', url).sequence('id').attr('id_str', ['id'], function (id) {
      return id.toString();
    }).attr('indices', indices).attr('media_url', url).attr('media_url_https', url.replace('http', 'https')).attr('sizes', Sizes().build()).attr('source_status_id', status_id ? parseInt(status_id, 10) : null).attr('source_status_id_str', status_id ? status_id.toString() : null).attr('type', _tweet.TWEET_TYPES.PHOTO).attr('url', _faker["default"].internet.url());
  }
};

exports.MediaEntity = MediaEntity;

var Sizes = function Sizes() {
  var _Size$buildList = Size().buildList(4),
      _Size$buildList2 = _slicedToArray(_Size$buildList, 4),
      t = _Size$buildList2[0],
      s = _Size$buildList2[1],
      m = _Size$buildList2[2],
      l = _Size$buildList2[3];

  return new _rosie.Factory().attr('thumb', t).attr('small', s).attr('medium', m).attr('large', l);
};

exports.Sizes = Sizes;

var Size = function Size() {
  return new _rosie.Factory().attr('w', _faker["default"].random.number()).attr('h', _faker["default"].random.number()).attr('resize', new _chance.Chance().pickone(['fit', 'crop']));
};

exports.Size = Size;

var ExtendedEntities = function ExtendedEntities(tweet_type, mediaEntity) {
  return new _rosie.Factory().attr('media', function () {
    return mediaEntity.map(function (mediaObj) {
      return _objectSpread({}, mediaObj, {
        type: tweet_type,
        video_info: {
          aspect_ratio: [],
          duration_millis: 0,
          variants: [{
            bitrate: 0,
            content_type: 'video/mp4',
            url: media[tweet_type].video_url
          }]
        }
      });
    });
  });
};

exports.ExtendedEntities = ExtendedEntities;

var ExtendedTweet = function ExtendedTweet(text, entities) {
  return new _rosie.Factory().attr('full_text', text).attr('display_text_range', function () {
    var _twitter$parseTweet = _twitterText["default"].parseTweet(text),
        displayRangeStart = _twitter$parseTweet.displayRangeStart,
        displayRangeEnd = _twitter$parseTweet.displayRangeEnd;

    return [displayRangeStart, displayRangeEnd];
  }).attr('entities', entities);
};

exports.ExtendedTweet = ExtendedTweet;

var Entities = function Entities(tweet_type, text, media_urls, status_id, user_id) {
  var extractedHashtags = _twitterText["default"].extractHashtagsWithIndices(text);

  var extractedUrls = _twitterText["default"].extractUrlsWithIndices(text);

  var extractedMentions = _twitterText["default"].extractMentionsWithIndices(text);

  return new _rosie.Factory().attr('hashtags', extractedHashtags.map(function (_ref) {
    var hashtag = _ref.hashtag,
        indices = _ref.indices;
    return {
      text: hashtag,
      indices: indices
    };
  })).attr('media', tweet_type !== 'text_only' ? extractedUrls.filter(function (_ref2) {
    var url = _ref2.url;
    return media_urls.includes(url);
  }).map(function (_ref3, index) {
    var url = _ref3.url,
        indices = _ref3.indices;
    return MediaEntity(tweet_type, {
      url: url,
      indices: indices,
      status_id: status_id,
      user_id: user_id
    }).build({
      id: index + 1
    });
  }) : []).attr('urls', extractedUrls.filter(function (_ref4) {
    var url = _ref4.url;
    return !media_urls.includes(url);
  }).map(function (_ref5) {
    var url = _ref5.url,
        indices = _ref5.indices;
    return UrlsEntity(url, indices).build();
  })).attr('user_mentions', extractedMentions.map(function (mention, index) {
    return UserMentionsEntity(mention, index, user_id).build();
  }));
};

exports.Entities = Entities;