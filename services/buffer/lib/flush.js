"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.flush = void 0;

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; var ownKeys = Object.keys(source); if (typeof Object.getOwnPropertySymbols === 'function') { ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) { return Object.getOwnPropertyDescriptor(source, sym).enumerable; })); } ownKeys.forEach(function (key) { _defineProperty(target, key, source[key]); }); } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

const postJSON =
/*#__PURE__*/
function () {
  var _ref = _asyncToGenerator(function* (url) {
    let data = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    try {
      const headers = _objectSpread({}, options.headers, {
        'content-type': 'application/json'
      });

      const fetchOptions = _objectSpread({}, options, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data)
      });

      const res = yield fetch(url, fetchOptions);

      if (res.status !== 200) {
        const error = new Error("".concat(res.status, " - ").concat(res.statusText));
        error.response = res;
        throw error;
      }

      return yield res.json();
    } catch (err) {
      throw err;
    }
  });

  return function postJSON(_x) {
    return _ref.apply(this, arguments);
  };
}();
/**
 * Options:
 * - debug:        (bool: false)
 * - ignoreErrors: (bool: false) avoid to throw in case of graphql errors
 * - endpoint:     (string: null) provide a custom http endpoint
 *
 * Returns:
 * { data: {}, errors: [] }
 */


const runQuery =
/*#__PURE__*/
function () {
  var _ref2 = _asyncToGenerator(function* () {
    let query = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
    let variables = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    let options = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};

    if (!query) {
      throw new Error('[graphql] please provide a query');
    }

    const endpoint = options.endpoint,
          debug = options.debug,
          ignoreErrors = options.ignoreErrors,
          otherOptions = _objectWithoutProperties(options, ["endpoint", "debug", "ignoreErrors"]);

    let result = null;

    const fetchOptions = _objectSpread({
      credentials: 'include'
    }, otherOptions);

    if (debug) {
      console.log('>>>>>>>>>>>> GRAPHQL');
      console.log(endpoint || runQuery.endpoint);
      console.log(query);
      console.log(variables);
      console.log(fetchOptions);
      console.log(JSON.stringify(variables));
      console.log('<<<<<<<<<<< GRAPHQL');
    }

    try {
      result = yield postJSON(endpoint || runQuery.endpoint, {
        query,
        variables
      }, fetchOptions);
    } catch (err) {
      // must be a real network error
      if (!err.response) {
        const error = new Error("[graphql] ".concat(err.message));
        error.query = query;
        error.originalError = err;
        throw error;
      } // might be a graphql handled error


      try {
        result = JSON.parse((yield err.response.text()));
      } catch (jsonErr) {
        throw err;
      }
    }

    if (result.errors && ignoreErrors !== true) {
      const error = new Error(result.errors[0].message);
      error.graphQLErrors = result.errors;
      error.graphQLResponse = result;
      throw error;
    }

    return result;
  });

  return function runQuery() {
    return _ref2.apply(this, arguments);
  };
}();

const query = "mutation trackMetrics (\n    $token: String!\n    $metrics: [MetricRecord]!  \n    $logs: [LogRecord]!  \n) {\n    api (token:$token) {\n        trackMetrics (data: $metrics)\n        trackLogs (data: $logs)\n    }\n}";

const flush =
/*#__PURE__*/
function () {
  var _ref3 = _asyncToGenerator(function* (chunk, target) {
    const res = yield runQuery(query, {
      token: target.token,
      metrics: chunk.metrics,
      events: chunk.events,
      logs: chunk.logs
    }, {
      // debug: true,
      endpoint: target.endpoint
    });
    return res.data.api.trackMetrics;
  });

  return function flush(_x2, _x3) {
    return _ref3.apply(this, arguments);
  };
}();

exports.flush = flush;