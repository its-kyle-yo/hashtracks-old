"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = exports.makeMediaUrlString = exports.makeUrlString = exports.makeTypeString = exports.TWEET_TYPES = void 0;

var _twitterText = _interopRequireDefault(require("twitter-text"));

var _faker = _interopRequireDefault(require("faker"));

var _rosie = require("rosie");

var _entities = require("./entities");

var _chance = require("chance");

var _post = require("../post");

var _user = _interopRequireDefault(require("./user"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _iterableToArray(iter) { if (typeof Symbol !== "undefined" && Symbol.iterator in Object(iter)) return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) return _arrayLikeToArray(arr); }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(n); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { if (typeof Symbol === "undefined" || !(Symbol.iterator in Object(arr))) return; var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

var _UserFactory$buildLis = (0, _user["default"])().buildList(2),
    _UserFactory$buildLis2 = _slicedToArray(_UserFactory$buildLis, 2),
    UserOne = _UserFactory$buildLis2[0],
    UserTwo = _UserFactory$buildLis2[1];

var TWEET_TYPES = {
  PHOTO: _post.media_types.PHOTO,
  VIDEO: _post.media_types.VIDEO,
  GIF: _post.media_types.GIF,
  TEXT_ONLY: 'text_only'
};
exports.TWEET_TYPES = TWEET_TYPES;

var makeTypeString = function makeTypeString(chanceType, numberOfType) {
  return _toConsumableArray(Array(numberOfType)).map(function () {
    return new _chance.Chance()[chanceType]().substring(0, 3);
  }).join(' ');
};

exports.makeTypeString = makeTypeString;

var makeUrlString = function makeUrlString(numberOfUrls, urlLength) {
  return _toConsumableArray(Array(numberOfUrls)).map(function () {
    return "http://".concat(new _chance.Chance().word({
      length: urlLength
    }), ".com");
  }).join(' ');
};

exports.makeUrlString = makeUrlString;

var makeMediaUrlString = function makeMediaUrlString() {
  var numberOfUrls = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 4;
  var type = arguments.length > 1 ? arguments[1] : undefined;

  if (type === TWEET_TYPES.PHOTO) {
    return _toConsumableArray(Array(numberOfUrls)).map(function () {
      return _entities.media[type].image_url;
    }).join(' ');
  }

  if (type !== TWEET_TYPES.TEXT_ONLY) {
    return _entities.media[type].image_url;
  }

  return '';
};

exports.makeMediaUrlString = makeMediaUrlString;

var _default = function _default() {
  return new _rosie.Factory().attr('created_at', _faker["default"].date.past()).sequence('id', function (id) {
    return parseInt(id);
  }).attr('id_str', ['id'], function (id) {
    return id.toString();
  }).option('tweet_type', TWEET_TYPES.GIF).option('extended', false).option('characters', new _chance.Chance().word({
    length: 5
  })).option('truncated_text', new _chance.Chance().word({
    length: 137
  }) + '...').option('emoji', '💩🚀🤷‍♂️🤦‍♂️').option('mentions', makeTypeString('twitter', 2)).option('hashtags', makeTypeString('hashtag', 2)).option('media_urls', ['tweet_type'], function (tweet_type) {
    return makeMediaUrlString(4, tweet_type);
  }).option('urls', makeUrlString(2, 4)).option('extended_text', ['characters', 'emoji', 'mentions', 'hashtags', 'urls', 'media_urls'], function (characters, emoji, mentions, hashtags, urls, media_urls) {
    return "".concat(characters, " ").concat(emoji, " ").concat(mentions, " ").concat(hashtags, " ").concat(urls, " ").concat(media_urls);
  }).attr('text', ['tweet_type', 'extended', 'truncated_text', 'extended_text'], function (tweet_type, extended, truncated_text, extended_text) {
    if (Object.is(tweet_type, TWEET_TYPES.TEXT_ONLY) && !extended) {
      return new _chance.Chance().word({
        length: 140
      });
    }

    if (extended) {
      return truncated_text;
    }

    return extended_text;
  }).attr('display_text_range', ['text'], function (text) {
    var _twitter$parseTweet = _twitterText["default"].parseTweet(text),
        displayRangeStart = _twitter$parseTweet.displayRangeStart,
        displayRangeEnd = _twitter$parseTweet.displayRangeEnd;

    return [displayRangeStart, displayRangeEnd];
  }).attr('source', '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>').attr('truncated', ['extended'], function (extended) {
    return extended;
  }).option('is_reply', false).attr('reply_status', ['is_reply', 'id'], function (is_reply, id) {
    return is_reply ? QuoteTweet(id).build() : null;
  }).attr('in_reply_to_status_id', ['is_reply', 'reply_status'], function (isReply, replyStatus) {
    return isReply ? replyStatus.id : null;
  }).attr('in_reply_to_status_id_str', ['is_reply', 'reply_status'], function (isReply, replyStatus) {
    return isReply ? replyStatus.id_str : null;
  }).attr('in_reply_to_user_id', ['is_reply'], function (isReply) {
    return isReply ? UserTwo.id : null;
  }).attr('in_reply_to_user_id_str', ['is_reply'], function (isReply) {
    return isReply ? UserTwo.id_str : null;
  }).attr('in_reply_to_screen_name', ['is_reply'], function (isReply) {
    return isReply ? UserTwo.screen_name : null;
  }).attr('user', UserOne).attr('coordinates', new _chance.Chance().coordinates().split(',').map(function (point) {
    return point.trim();
  })).attr('place', null).option('quote_tweet', false).attr('is_quote_status', ['quote_tweet'], function (quote_tweet) {
    return quote_tweet;
  }).attr('quoted_status', ['quote_tweet', 'id'], function (quote_tweet, id) {
    return quote_tweet ? QuoteTweet(id).build({
      retweeted: false
    }) : null;
  }).attr('quoted_status_id', ['quote_tweet', 'quoted_status'], function (isQuoteTweet, status) {
    return isQuoteTweet ? status.id : null;
  }).attr('quoted_status_id_str', ['quote_tweet', 'quoted_status'], function (isQuoteTweet, status) {
    return isQuoteTweet ? status.id_str : null;
  }).option('is_retweet', false).attr('retweeted_status', ['is_retweet', 'id'], function (is_retweet, id) {
    is_retweet ? QuoteTweet(id).build() : null;
  }).attr('quote_count', _faker["default"].random.number()).attr('reply_count', _faker["default"].random.number()).attr('retweet_count', _faker["default"].random.number()).attr('entities', ['tweet_type', 'text', 'media_urls', 'in_reply_to_status_id', 'in_reply_to_user_id'], function (tweet_type, text, media_urls, in_reply_to_status_id, in_reply_to_user_id) {
    return (0, _entities.Entities)(tweet_type, text, media_urls, in_reply_to_status_id, in_reply_to_user_id).build();
  }).attr('extended_entities', ['tweet_type', 'entities'], function (tweet_type, _ref) {
    var media = _ref.media;

    if (![TWEET_TYPES.PHOTO, TWEET_TYPES.TEXT_ONLY].includes(tweet_type)) {
      return (0, _entities.ExtendedEntities)(tweet_type, media).build();
    }
  }).attr('favorited', false).attr('retweeted', false).attr('possibly_sensitive', false).attr('lang', 'en').attr('extended_tweet', ['extended_text', 'entities'], function (extended_text, entities) {
    return (0, _entities.ExtendedTweet)(extended_text, entities).build();
  }).after(function (tweet, options) {
    // Options are only present if the tweet is a quote status
    if (Object.is(options.quote_tweet, false)) {
      delete tweet.quoted_status;
      delete tweet.quoted_status_id;
      delete tweet.quoted_status_id_str;
    } // Option is only present if links are in tweet


    if (Object.is(options.tweet_type, TWEET_TYPES.TEXT_ONLY)) {
      delete tweet.possibly_sensitive;
    }

    if (Object.is(options.tweet_type, TWEET_TYPES.PHOTO)) {
      delete tweet.extended_entities;
    }

    if (Object.is(options.extended, true)) {
      tweet.entities.hashtags = [];
    } else {
      delete tweet.extended_tweet;
    }
  });
};

exports["default"] = _default;

var QuoteTweet = function QuoteTweet(other_id) {
  return new _rosie.Factory().attr('created_at', _faker["default"].date.past()).sequence('id', function (id) {
    return parseInt(id) + other_id;
  }).attr('id_str', ['id'], function (id) {
    return id.toString();
  }).option('tweet_type', TWEET_TYPES.GIF).option('extended', false).option('characters', new _chance.Chance().word({
    length: 5
  })).option('truncated_text', new _chance.Chance().word({
    length: 137
  }) + '...').option('emoji', '💩🚀🤷‍♂️🤦‍♂️').option('mentions', _toConsumableArray(Array(2)).map(function () {
    return new _chance.Chance().twitter().substring(0, 3);
  }).join(' ')).option('hashtags', _toConsumableArray(Array(2)).map(function () {
    return new _chance.Chance().hashtag().substring(0, 3);
  }).join(' ')).option('extended_text', ['characters', 'emoji', 'mentions', 'hashtags', 'urls', 'media_urls'], function (characters, emoji, mentions, hashtags, urls, media_urls) {
    return "".concat(characters, " ").concat(emoji, " ").concat(mentions, " ").concat(hashtags, " ").concat(urls, " ").concat(media_urls);
  }).option('media_urls', ['tweet_type'], function (tweet_type) {
    if (tweet_type === TWEET_TYPES.PHOTO) {
      return _toConsumableArray(Array(4)).map(function () {
        return _entities.media[tweet_type].image_url;
      }).join(' ');
    }

    if (tweet_type !== TWEET_TYPES.TEXT_ONLY) {
      return _entities.media[tweet_type].image_url;
    }

    return '';
  }).option('urls', _toConsumableArray(Array(2)).map(function () {
    return "http://".concat(new _chance.Chance().word({
      length: 4
    }), ".com");
  }).join(' ')).attr('text', ['tweet_type', 'extended', 'truncated_text', 'extended_text'], function (tweet_type, extended, truncated_text, extended_text) {
    if (Object.is(tweet_type, TWEET_TYPES.TEXT_ONLY) && !extended) {
      return new _chance.Chance().word({
        length: 140
      });
    }

    if (extended) {
      return truncated_text;
    }

    return extended_text;
  }).attr('display_text_range', ['text'], function (text) {
    var _twitter$parseTweet2 = _twitterText["default"].parseTweet(text),
        displayRangeStart = _twitter$parseTweet2.displayRangeStart,
        displayRangeEnd = _twitter$parseTweet2.displayRangeEnd;

    return [displayRangeStart, displayRangeEnd];
  }).attr('source', '<a href="https://mobile.twitter.com" rel="nofollow">Twitter Web App</a>').attr('truncated', ['extended'], function (extended) {
    return extended;
  }).attr('user', UserTwo).attr('coordinates', new _chance.Chance().coordinates().split(',').map(function (point) {
    return point.trim();
  })).attr('place', null).attr('quote_count', _faker["default"].random.number()).attr('reply_count', _faker["default"].random.number()).attr('retweet_count', _faker["default"].random.number()).attr('favorite_count', _faker["default"].random.number()).attr('entities', {}).attr('extended_entities', {}).attr('favorited', true).attr('retweeted', true).attr('possibly_sensitive', false).attr('lang', 'en');
};