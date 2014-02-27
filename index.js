/*jslint indent: 2, node: true, nomen: true*/
"use strict";

var kindof = require("kindof");

function regexpErrMsg(propName, inputPattern, input) {
  return "expected argument " + propName + " to match " + inputPattern.toString() + " (was \"" + input + "\")";
}

function errMsg(propName, inputType, schemaType) {
  return "expected argument " + propName + " to be of type " + schemaType + " (was " + inputType + ")";
}

function getErrs(input, schema, prefix) {
  var prop,
    type,
    schemaType,
    errs = [];

  prefix = prefix || "";

  for (prop in schema) {
    if (schema.hasOwnProperty(prop)) {
      type = kindof(input[prop]);
      schemaType = kindof(schema[prop]);

      if (schemaType === "object") {
        if (type === "object") {
          // if both input and schema properties are objects
          // we'll need to recurse
          errs.push(getErrs(input[prop], schema[prop], prefix + prop + "."));
        } else {
          errs.push(errMsg(prefix + prop, type, "object"));
        }
      } else if (schemaType === "regexp") {
        if (type === "string" && !schema[prop].test(input[prop])) {
          errs.push(regexpErrMsg(prefix + prop, schema[prop], input[prop]));
        } else if (type !== "string") {
          errs.push(errMsg(prefix + prop, type, "string"));
        }
      } else if (type !== schema[prop]) {
        errs.push(errMsg(prefix + prop, type, schema[prop]));
      }
    }
  }

  return errs;
}

exports.err = function (input, schema) {
  var errs = getErrs(input, schema);
  return errs.length ? errs.join("\n") : null;
};
