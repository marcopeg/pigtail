"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRecord = exports.recordType = void 0;

var _pigtailError = require("./pigtail-error.class");

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * LOG
 */
const createLog_ = (data, settings) => {
  const message = data.message,
        host = data.host,
        process = data.process,
        ctime = data.ctime,
        meta = _objectWithoutProperties(data, ["message", "host", "process", "ctime"]);

  if (!message) {
    throw new _pigtailError.PigtailError('missing log "message"');
  }

  if (ctime && !(ctime instanceof Date)) {
    throw new _pigtailError.PigtailError('ctime is not a valid date');
  }

  return {
    message,
    host: host || settings.hostName,
    process: process || settings.processName,
    ctime: ctime || null,
    meta
  };
};

const createLog = (data, settings) => {
  if (typeof data === 'string') {
    return createLog_({
      message: data
    }, settings);
  }

  if (typeof data !== 'object') {
    throw new _pigtailError.PigtailError('an object was expected');
  }

  return createLog_(data, settings);
};
/**
 * EVENT
 */


const createEvent_ = (event, settings) => {
  const name = event.name,
        ctime = event.ctime,
        host = event.host,
        process = event.process,
        identity = event.identity,
        payload = _objectWithoutProperties(event, ["name", "ctime", "host", "process", "identity"]);

  if (!name) {
    throw new _pigtailError.PigtailError('missing event "name"');
  }

  if (ctime && !(ctime instanceof Date)) {
    throw new _pigtailError.PigtailError('ctime is not a valid date');
  }

  return {
    name,
    payload,
    identity: identity || null,
    host: host || settings.hostName,
    process: process || settings.processName,
    ctime: ctime || null
  };
};

const createEvent = (name, payload, settings) => {
  if (typeof name === 'object') {
    return createEvent_(name, payload);
  }

  if (typeof name === 'string' && typeof payload === 'object') {
    return createEvent_(_objectSpread({}, payload, {
      name
    }), settings);
  }

  throw new _pigtailError.PigtailError('unexpected event format');
};
/**
 * METRIC
 */


const createMetric = data => {};

const recordType = {
  LOG: 'l',
  EVENT: 'e',
  METRIC: 'm'
};
exports.recordType = recordType;

const createRecord = function createRecord(type) {
  for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  switch (type) {
    case recordType.LOG:
      return createLog(...args);

    case recordType.EVENT:
      return createEvent(...args);

    case recordType.METRIC:
      return createMetric(...args);
  }
};

exports.createRecord = createRecord;