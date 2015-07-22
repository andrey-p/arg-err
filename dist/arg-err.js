(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.argErr = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

var kindof = require("kindof"),
  wordToUse = "argument";

function regexpErrMsg(args) {
  return "expected" + (args.optional ? " optional" : "")
    + " " + wordToUse + " " + args.propName
    + " to match " + args.inputPattern.toString()
    + " (was \"" + args.input + "\")";
}

function errMsg(args) {
  return "expected" + (args.optional ? " optional" : "")
    + " " + wordToUse + " " + args.propName
    + " to be of type " + args.schemaType
    + " (was " + args.inputType + ")";
}

function functionErrMsg(args) {
  var functionName;

  // extract the function name from its source
  // to try and give a useful error message
  try {
    functionName = /function\s+([a-zA-Z0-9_]+)\s*\(/.exec(args.functionSource)[1];
  } catch (e) {
    functionName = "anonymous function";
  }

  return "expected" + (args.optional ? " optional" : "")
    + " " + wordToUse + " " + args.propName
    + " to pass " + functionName;
}

function recursiveFlatten(array, result) {
  var i;

  result = result || [];

  for (i = 0; i < array.length; i += 1) {
    if (kindof(array[i]) === "array") {
      recursiveFlatten(array[i], result);
    } else {
      result.push(array[i]);
    }
  }
  return result;
}

function getExpectedTypeFromSchemaProperty(schemaProperty) {
  var typeToReturn,
    actualType = kindof(schemaProperty);

  if (actualType === "object") {
    typeToReturn = "object";
  } else if (actualType === "regexp") {
    typeToReturn = "string";
  } else if (actualType === "array") {
    typeToReturn = schemaProperty.map(getExpectedTypeFromSchemaProperty).join(" or ");
  } else {
    typeToReturn = schemaProperty;
  }

  return typeToReturn;
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
    passedSpecialCases,
    errs = [];

  // used for array schema types
  // where all we need is to pass a single array element
  function someSchemasValidate(propName) {
    return schema[propName].some(function (possibleType) {
      var tempInput = {},
        tempSchema = {},
        tempErrs;

      tempInput[propName] = input[propName];
      tempSchema[propName] = possibleType;
      tempErrs = getErrs({
        input: tempInput,
        schema: tempSchema,
        optional: optional
      });

      return tempErrs.length === 0;
    });
  }

  for (prop in schema) {
    if (schema.hasOwnProperty(prop)) {
      passedSpecialCases = false;
      type = kindof(input[prop]);
      schemaType = kindof(schema[prop]);

      // any kinds of checks are pointless if optional schema
      // if property is undefined
      if (optional && type === "undefined") {
        continue;
      }

      // special cases where the schema prop is not defined as a string
      // if input prop does not fit the special case,
      // defer to normal type checking
      if (schemaType === "array") {
        // if schema type is an array, we need to check
        // whether some of them validate
        //
        // if at least one validates, there's no error
        if (someSchemasValidate(prop)) {
          passedSpecialCases = true;
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

          passedSpecialCases = true;
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

          passedSpecialCases = true;
        }
      } else if (schemaType === "function") {
        // special case function
        // run the property against the function
        if (!schema[prop](input[prop])) {
          errs.push(functionErrMsg({
            propName: prefix + prop,
            functionSource: schema[prop].toString(),
            optional: optional
          }));
        }

        passedSpecialCases = true;
      } else if (schemaType !== "string") {
        throw new Error("Unsupported schema type: " + schemaType + ". Supported ones are string, object, regexp or array");
      }

      expectedType = getExpectedTypeFromSchemaProperty(schema[prop]);
      if (!passedSpecialCases && type !== expectedType) {
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

exports.config = function (opts) {
  // if you'd rather be pedantic about what you're checking
  wordToUse = opts.propErr ? "property" : "argument";

  return this;
};

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

  // in complex schemas (think nested objects two levels deep)
  // join() doesn't work properly and leaves artifacts
  // so we need to flatten everything first
  errs = recursiveFlatten(errs);

  return errs.length ? errs.join(", ") : null;
};

},{"kindof":2}],2:[function(require,module,exports){
if (typeof module != "undefined") module.exports = kindof

function kindof(obj) {
  var type
  if (obj === undefined) return "undefined"
  if (obj === null) return "null"

  switch (type = typeof obj) {
    case "object":
      switch (Object.prototype.toString.call(obj)) {
        case "[object RegExp]": return "regexp"
        case "[object Date]": return "date"
        case "[object Array]": return "array"
      }

    default: return type
  }
}

},{}]},{},[1])(1)
});