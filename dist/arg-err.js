!function(e){if("object"==typeof exports)module.exports=e();else if("function"==typeof define&&define.amd)define(e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.argErr=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(_dereq_,module,exports){
/*jslint indent: 2, node: true, continue: true*/
"use strict";

var kindof = _dereq_("kindof");

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

},{"kindof":2}],2:[function(_dereq_,module,exports){
if (typeof module != "undefined") module.exports = kindof

function kindof(obj) {
  if (obj === undefined) return "undefined"
  if (obj === null) return "null"

  switch (Object.prototype.toString.call(obj)) {
    case "[object Boolean]": return "boolean"
    case "[object Number]": return "number"
    case "[object String]": return "string"
    case "[object RegExp]": return "regexp"
    case "[object Date]": return "date"
    case "[object Array]": return "array"
    default: return typeof obj
  }
}

},{}]},{},[1])
(1)
});