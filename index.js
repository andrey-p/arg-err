/*jslint indent: 2, node: true, nomen: true*/
"use strict";

var kindof = require("kindof");

function regexpErrMsg(args) {
  return "expected" + (args.optional ? " optional" : "")
    + " argument " + args.propName
    + " to match " + args.inputPattern.toString()
    + " (was \"" + args.input + "\")";
}

function errMsg(args) {
  return "expected" + (args.optional ? " optional" : "")
    + " argument " + args.propName
    + " to be of type " + args.schemaType
    + " (was " + args.inputType + ")";
}

function getErrs(args) {
  // not checking whether args is valid because... seriously?
  var prop,
    schema = args.schema,
    input = args.input,
    prefix = args.prefix || "",
    optional = args.optional || false,
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
            prefix: prefix + prop + ".",
            optional: optional
          }));
        } else {
          errs.push(errMsg({
            propName: prefix + prop,
            inputType: type,
            schemaType: "object",
            optional: optional
          }));
        }
      } else if (schemaType === "regexp") {
        if (type === "string" && !schema[prop].test(input[prop])) {
          errs.push(regexpErrMsg({
            propName: prefix + prop,
            inputPattern: schema[prop],
            input: input[prop],
            optional: optional
          }));
        } else if (type !== "string") {
          errs.push(errMsg({
            propName: prefix + prop,
            inputType: type,
            schemaType: "string",
            optional: optional
          }));
        }
      } else if (type !== schema[prop]
          && !(type === "undefined" && optional)) {
        errs.push(errMsg({
          propName: prefix + prop,
          inputType: type,
          schemaType: schema[prop],
          optional: optional
        }));
      }
    }
  }

  return errs;
}

exports.err = function (input, schema, optionalSchema) {
  var errs = getErrs({
    input: input,
    schema: schema
  });

  if (optionalSchema) {
    errs = errs.concat(getErrs({
      input: input,
      schema: optionalSchema,
      optional: true
    }));
  }

  return errs.length ? errs.join(", ") : null;
};
