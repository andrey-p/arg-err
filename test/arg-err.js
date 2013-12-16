/*jslint indent: 2, node: true, nomen: true*/
/*globals it, describe*/
"use strict";

var arg = require("../index"),
  should = require("should");

describe("arg-err", function () {
  it("should give no error for valid args", function () {
    var input = { foo: 2 },
      err = arg.err(input, { foo: "number" });

    should.not.exist(err);
    (err === null).should.be.true;
  });
  it("should give an error for invalid args", function () {
    var input = { foo: "2" },
      err = arg.err(input, { foo: "number" });

    should.exist(err);
    err.should.equal("expected argument foo to be of type number (was string)");
  });
  it("should give an error for missing args", function () {
    var input = { foo: 2 },
      err = arg.err(input, { foo: "number", bar: "string" });

    should.exist(err);
    err.should.equal("expected argument bar to be of type string (was undefined)");
  });
  it("should give multiple errors on multiple lines", function () {
    var input = { foo: "2", bar: 123 },
      err = arg.err(input, { foo: "number", bar: "string" });

    err.should.equal("expected argument foo to be of type number (was string)\nexpected argument bar to be of type string (was number)");
  });
  it("should be able to validate nested objects", function () {
    var input = { foo: "2", bar: { baz: { bat: 1234 } } },
      schema = { foo: "string", bar: { baz: { bat: "string" } } },
      err = arg.err(input, schema);

    err.should.include("expected argument bar.baz.bat to be of type string (was number)");
  });
  it("should report incorrectly typed objects in the input without recursing", function () {
    var input = { foo: "2", bar: 123 },
      schema = { foo: "string", bar: { baz: { bat: "string" } } },
      err = arg.err(input, schema);

    err.should.include("expected argument bar to be of type object (was number)");
  });
});
