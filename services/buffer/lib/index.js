"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createPigtailClient = void 0;

var _validateSettings = require("./validate-settings");

var _createRecord = require("./create-record");

var _flush = require("./flush");

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
    chunks: []
  };

  const pushRecord = (record, target) => {
    const recordSize = Buffer.byteLength(JSON.stringify(record), 'utf8'); // generate a new chunk based on data size limit

    if (data.currentSize + recordSize > settings.maxChunkSize) {
      createChunk();
    } // queue the new record and update size counters


    data[target].push(record);
    data.currentSize += recordSize;
    data.totalSize += recordSize;
  }; // empty the live data collection structure and queue a new
  // chunk that needs to be flushed out to the server


  const createChunk = () => {
    if (data.currentSize === 0) {
      return;
    }

    const chunk = {
      size: data.currentSize,
      ctime: new Date(),
      attempts: 0,
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
  };

  const flushChunk =
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(function* () {
      if (data.chunks.length === 0) {
        return 100;
      }

      const chunk = data.chunks.shift();

      try {
        yield (0, _flush.flush)(chunk, settings.target);
        data.totalSize -= chunk.size;
        data.chunksSize -= chunk.size;
      } catch (err) {
        if (chunk.attempts < 5) {
          chunk.attempts += 1;
          data.chunks.unshift(chunk);
        }
      }

      return 0;
    });

    return function flushChunk() {
      return _ref.apply(this, arguments);
    };
  }(); // generate new chunks based on time intervals


  const chunksLoop = () => {
    createChunk();
    chunksLoop.timer = setTimeout(chunksLoop, settings.maxInterval);
  }; // stream data to the server on regular intervals


  const flushLoop =
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(function* () {
      const interval = yield flushChunk();
      flushLoop.timer = setTimeout(flushLoop, interval);
    });

    return function flushLoop() {
      return _ref2.apply(this, arguments);
    };
  }();
  /**
   * Public API
   */


  const publicApi = {
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
    },
    flush: () => {
      createChunk();
      clearTimeout(flushLoop.timer);
      return flushLoop();
    } // Expose the internal stuff for testing purposes.

  };

  if (process.env.NODE_ENV === 'test') {
    publicApi.getState = () => ({
      settings,
      data
    });

    publicApi.createChunk = createChunk;
    publicApi.flushChunk = flushChunk; // Start the daemons right away in production
  } else {
    chunksLoop.timer = setTimeout(chunksLoop, settings.maxInterval);
    flushLoop.timer = setTimeout(flushLoop, 0);
  }

  return publicApi;
};

exports.createPigtailClient = createPigtailClient;