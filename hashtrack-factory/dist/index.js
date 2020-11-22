"use strict";

var _user = _interopRequireDefault(require("./user"));

var _post = _interopRequireDefault(require("./post"));

var _webhook = _interopRequireDefault(require("./webhook"));

var _tweet = _interopRequireDefault(require("./twitter/tweet"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var UserFactory = (0, _user["default"])();
var PostFactory = (0, _post["default"])();
var WebhookFactory = (0, _webhook["default"])();
var TweetFactory = (0, _tweet["default"])();
module.exports = {
  UserFactory: UserFactory,
  PostFactory: PostFactory,
  WebhookFactory: WebhookFactory,
  TweetFactory: TweetFactory
};