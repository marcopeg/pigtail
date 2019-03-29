"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPigtailClient = void 0;

var _validateSettings = require("./validate-settings");

const createPigtailClient = receivedSettings => {
  const settings = (0, _validateSettings.validateSettings)(receivedSettings);
  const data = {
    logs: [],
    metrics: [],
    events: []
  };
  return {
    log: () => {},
    trackMetric: () => {},
    pushEvent: () => {}
  };
};

exports.createPigtailClient = createPigtailClient;