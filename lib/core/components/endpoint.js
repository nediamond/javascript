"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = _default;

var _uuid = _interopRequireDefault(require("./uuid"));

var _flow_interfaces = require("../flow_interfaces");

var _utils = _interopRequireDefault(require("../utils"));

var _config = _interopRequireDefault(require("./config"));

var _operations = _interopRequireDefault(require("../constants/operations"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var PubNubError = function (_Error) {
  _inherits(PubNubError, _Error);

  function PubNubError(message, status) {
    var _this;

    _classCallCheck(this, PubNubError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(PubNubError).call(this, message));
    _this.name = _this.constructor.name;
    _this.status = status;
    _this.message = message;
    return _this;
  }

  return PubNubError;
}(_wrapNativeSuper(Error));

function createError(errorPayload, type) {
  errorPayload.type = type;
  errorPayload.error = true;
  return errorPayload;
}

function createValidationError(message) {
  return createError({
    message: message
  }, 'validationError');
}

function decideURL(endpoint, modules, incomingParams) {
  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    return endpoint.postURL(modules, incomingParams);
  } else {
    return endpoint.getURL(modules, incomingParams);
  }
}

function generatePNSDK(config) {
  if (config.sdkName) {
    return config.sdkName;
  }

  var base = "PubNub-JS-".concat(config.sdkFamily);

  if (config.partnerId) {
    base += "-".concat(config.partnerId);
  }

  base += "/".concat(config.getVersion());
  return base;
}

function signRequest(modules, url, outgoingParams) {
  var config = modules.config,
      crypto = modules.crypto;
  outgoingParams.timestamp = Math.floor(new Date().getTime() / 1000);
  var signInput = "".concat(config.subscribeKey, "\n").concat(config.publishKey, "\n").concat(url, "\n");
  signInput += _utils["default"].signPamFromParams(outgoingParams);
  var signature = crypto.HMACSHA256(signInput);
  signature = signature.replace(/\+/g, '-');
  signature = signature.replace(/\//g, '_');
  outgoingParams.signature = signature;
}

function _default(modules, endpoint) {
  var networking = modules.networking,
      config = modules.config;
  var callback = null;
  var promiseComponent = null;
  var incomingParams = {};

  if (endpoint.getOperation() === _operations["default"].PNTimeOperation || endpoint.getOperation() === _operations["default"].PNChannelGroupsOperation) {
    callback = arguments.length <= 2 ? undefined : arguments[2];
  } else {
    incomingParams = arguments.length <= 2 ? undefined : arguments[2];
    callback = arguments.length <= 3 ? undefined : arguments[3];
  }

  if (typeof Promise !== 'undefined' && !callback) {
    promiseComponent = _utils["default"].createPromise();
  }

  var validationResult = endpoint.validateParams(modules, incomingParams);

  if (validationResult) {
    if (callback) {
      return callback(createValidationError(validationResult));
    } else if (promiseComponent) {
      promiseComponent.reject(new PubNubError('Validation failed, check status for details', createValidationError(validationResult)));
      return promiseComponent.promise;
    }

    return;
  }

  var outgoingParams = endpoint.prepareParams(modules, incomingParams);
  var url = decideURL(endpoint, modules, incomingParams);
  var callInstance;
  var networkingParams = {
    url: url,
    operation: endpoint.getOperation(),
    timeout: endpoint.getRequestTimeout(modules)
  };
  outgoingParams.uuid = config.UUID;
  outgoingParams.pnsdk = generatePNSDK(config);

  if (config.useInstanceId) {
    outgoingParams.instanceid = config.instanceId;
  }

  if (config.useRequestId) {
    outgoingParams.requestid = _uuid["default"].createUUID();
  }

  if (endpoint.isAuthSupported() && config.getAuthKey()) {
    outgoingParams.auth = config.getAuthKey();
  }

  if (config.secretKey) {
    signRequest(modules, url, outgoingParams);
  }

  var onResponse = function onResponse(status, payload) {
    if (status.error) {
      if (callback) {
        callback(status);
      } else if (promiseComponent) {
        promiseComponent.reject(new PubNubError('PubNub call failed, check status for details', status));
      }

      return;
    }

    var parsedPayload = endpoint.handleResponse(modules, payload, incomingParams);

    if (callback) {
      callback(status, parsedPayload);
    } else if (promiseComponent) {
      promiseComponent.fulfill(parsedPayload);
    }
  };

  if (endpoint.usePost && endpoint.usePost(modules, incomingParams)) {
    var payload = endpoint.postPayload(modules, incomingParams);
    callInstance = networking.POST(outgoingParams, payload, networkingParams, onResponse);
  } else if (endpoint.useDelete && endpoint.useDelete()) {
    callInstance = networking.DELETE(outgoingParams, networkingParams, onResponse);
  } else {
    callInstance = networking.GET(outgoingParams, networkingParams, onResponse);
  }

  if (endpoint.getOperation() === _operations["default"].PNSubscribeOperation) {
    return callInstance;
  }

  if (promiseComponent) {
    return promiseComponent.promise;
  }
}
//# sourceMappingURL=endpoint.js.map
