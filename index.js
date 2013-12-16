/*jslint indent: 2, node: true, nomen: true*/
"use strict";

var kindof = require("kindof");

exports.err = function (input, schema) {
  var prop,
    type,
    errs = [],
    err;

  for (prop in input) {
    if (input.hasOwnProperty(prop) && schema.hasOwnProperty(prop)) {
      type = kindof(input[prop]);

      if (type !== schema[prop]) {
        errs.push("expected argument " + prop + " to be of type " + schema[prop] + " (was " + type + ")");
      }
    }
  }

  if (errs.length) {
    err = errs.join("\n");
  }

  return err;
};
