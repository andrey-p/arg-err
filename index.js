/*jslint indent: 2, node: true, nomen: true*/
"use strict";

var kindof = require("kindof");

function regexpErrMsg(args) {
  return "expected argument " + args.propName
    + " to match " + args.inputPattern.toString()
    + " (was \"" + args.input + "\")";
}

function errMsg(args) {
  return "expected argument " + args.propName
    + " to be of type " + args.schemaType
    + " (was " + args.inputType + ")";
}

function getErrs(args) {
  // not checking whether args is valid because... seriously?
  var prop,
    schema = args.schema,
    input = args.input,
    prefix = args.prefix || "",
    type,
    schemaType,
    errs = [];

  for (prop in schema) {
    if (schema.hasOwnProperty(prop)) {
      type = kindof(input[prop]);
      schemaType = kindof(schema[prop]);

      if (schemaType === "object") {
        if (type === "object") {
          // if both input and schema properties are objects
          // we'll need to recurse
          errs.push(getErrs({
            input: input[prop],
            schema: schema[prop],
            prefix: prefix + prop + "."
          }));
        } else {
          errs.push(errMsg({
            propName: prefix + prop,
            inputType: type,
            schemaType: "object"
          }));
        }
      } else if (schemaType === "regexp") {
        if (type === "string" && !schema[prop].test(input[prop])) {
          errs.push(regexpErrMsg({
            propName: prefix + prop,
            inputPattern: schema[prop],
            input: input[prop]
          }));
        } else if (type !== "string") {
          errs.push(errMsg({
            propName: prefix + prop,
            inputType: type,
            schemaType: "string"
          }));
        }
      } else if (type !== schema[prop]) {
        errs.push(errMsg({
          propName: prefix + prop,
          inputType: type,
          schemaType: schema[prop]
        }));
      }
    }
  }

  return errs;
}

exports.err = function (input, schema) {
  var errs = getErrs({
    input: input,
    schema: schema
  });

  return errs.length ? errs.join(", ") : null;
};
