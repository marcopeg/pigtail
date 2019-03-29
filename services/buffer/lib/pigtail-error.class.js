"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.PigtailError = void 0;

class PigtailError extends Error {
  constructor(message) {
    super("[PigtailClient] ".concat(message));
  }

}

exports.PigtailError = PigtailError;