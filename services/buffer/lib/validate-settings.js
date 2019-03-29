"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.validateSettings = void 0;

var _pigtailError = require("./pigtail-error.class");

const validateSettings = function validateSettings() {
  let settings = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

  if (!settings.target) {
    throw new _pigtailError.PigtailError('missing "target" setting');
  }

  const target = settings.target,
        hostName = settings.hostName,
        processName = settings.processName,
        maxChunkSize = settings.maxChunkSize,
        maxInterval = settings.maxInterval;
  return {
    target,
    hostName: hostName || 'default-host',
    processName: processName || 'default-proc',
    maxChunkSize: maxChunkSize || 64000,
    maxInterval: maxInterval || 10000
  };
};

exports.validateSettings = validateSettings;