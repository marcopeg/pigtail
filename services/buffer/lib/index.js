"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPigtailClient = void 0;

var _validateSettings = require("./validate-settings");

var _createRecord = require("./create-record");

const createPigtailClient = receivedSettings => {
  const settings = (0, _validateSettings.validateSettings)(receivedSettings);
  const data = {
    // size counter
    currentSize: 0,
    totalSize: 0,
    chunksSize: 0,
    // currently collected metrics
    logs: [],
    metrics: [],
    events: [],
    // queue of data to send out
    chunks: [] // empty the live data collection structure and queue a new
    // chunk that needs to be flushed out to the server

  };

  const createChunk = () => {
    const chunk = {
      size: data.currentSize,
      ctime: new Date(),
      logs: data.logs,
      metrics: data.metrics,
      events: data.events
    };
    data.logs = [];
    data.metrics = [];
    data.events = [];
    data.chunks.push(chunk);
    data.chunksSize += chunk.size;
    data.currentSize = 0;
  }; // generate new chunks based on time intervals


  const loop = () => {
    data.currentSize > 0 && createChunk();
    loop.timer = setTimeout(loop, settings.maxInterval);
  };

  loop.timer = setTimeout(loop, settings.maxInterval);

  const pushRecord = (record, target) => {
    const recordSize = Buffer.byteLength(JSON.stringify(record), 'utf8'); // generate a new chunk based on data size limit

    if (data.currentSize + recordSize > settings.maxChunkSize) {
      createChunk();
    } // queue the new record and update size counters


    data[target].push(record);
    data.currentSize += recordSize;
    data.totalSize += recordSize;
  };
  /**
   * Public API
   */


  const ctx = {
    log: function log() {
      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      const record = (0, _createRecord.createRecord)(_createRecord.recordType.LOG, ...args, settings);
      pushRecord(record, 'logs');
    },
    trackMetric: function trackMetric() {
      for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        args[_key2] = arguments[_key2];
      }

      const record = (0, _createRecord.createRecord)(_createRecord.recordType.METRIC, ...args, settings);
      pushRecord(record, 'metrics');
    },
    pushEvent: function pushEvent() {
      for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
        args[_key3] = arguments[_key3];
      }

      const record = (0, _createRecord.createRecord)(_createRecord.recordType.EVENT, ...args, settings);
      pushRecord(record, 'events');
    } // Expise the internal state for testing purposes.

  };

  if (process.env.NODE_ENV === 'test') {
    ctx.getState = () => ({
      settings,
      data
    });
  }

  return ctx;
};

exports.createPigtailClient = createPigtailClient;