/*jslint indent: 2, node: true, continue: true*/
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
    expectedType,
    passesSingleValidation,
    errs = [];

  for (prop in schema) {
    if (schema.hasOwnProperty(prop)) {
      type = kindof(input[prop]);
      expectedType = schema[prop];
      schemaType = kindof(schema[prop]);

      // any kinds of checks are pointless if optional schema
      if (optional && type === "undefined") {
        continue;
      }

      // special cases where the schema prop is not defined as a string
      // if input prop does not fit the special case,
      // switch to a simpler expected type
      if (schemaType === "array") {
        // if schema type is an array, we need to check
        // whether some of them validate
        passesSingleValidation = schema[prop].some(function (possibleType) {
          var tempInput = {},
            tempSchema = {},
            tempErrs;

          tempInput[prop] = input[prop];
          tempSchema[prop] = possibleType;
          tempErrs = getErrs({
            input: tempInput,
            schema: tempSchema,
            optional: optional
          });

          return tempErrs.length === 0;
        });

        if (passesSingleValidation) {
          continue;
        } else {
          // if none of them validate, we need
          // a list of all the possible property types
          // separated by "or"
          expectedType = schema[prop].map(function (possibleType) {
            schemaType = kindof(possibleType);

            if (schemaType !== "string") {
              possibleType = schemaType;
            }

            return possibleType;
          }).join(" or ");
        }
      } else if (schemaType === "object") {
        if (type === "object") {
          // if both input and schema properties are objects
          // we'll need to recurse
          errs.push(getErrs({
            input: input[prop],
            schema: schema[prop],
            prefix: prefix + prop + ".",
            optional: optional
          }));

          continue;
        } else {
          expectedType = "object";
        }
      } else if (schemaType === "regexp") {
        // special case regex
        // assuming regex matched fields are always strings
        if (type === "string" && !schema[prop].test(input[prop])) {
          errs.push(regexpErrMsg({
            propName: prefix + prop,
            inputPattern: schema[prop],
            input: input[prop],
            optional: optional
          }));

          continue;
        } else {
          expectedType = "string";
        }
      }

      if (type !== expectedType) {
        errs.push(errMsg({
          propName: prefix + prop,
          inputType: type,
          schemaType: expectedType,
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
