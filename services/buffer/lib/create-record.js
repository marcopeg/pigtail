"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createRecord = exports.recordType = void 0;

var _pigtailError = require("./pigtail-error.class");

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

/**
 * LOG
 */
const createLog_ = (data, settings) => {
  if (!data.message) {
    throw new _pigtailError.PigtailError('missing "message" property for the log');
  }

  const message = data.message,
        host = data.host,
        process = data.process,
        ctime = data.ctime,
        meta = _objectWithoutProperties(data, ["message", "host", "process", "ctime"]);

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


const createEvent = data => {};
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

const createRecord = (type, data, settings) => {
  switch (type) {
    case recordType.LOG:
      return createLog(data, settings);

    case recordType.EVENT:
      return createEvent(data, settings);

    case recordType.METRIC:
      return createMetric(data, settings);
  }
};

exports.createRecord = createRecord;