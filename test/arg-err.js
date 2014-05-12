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

    err.should.equal("expected argument foo to be of type number (was string), expected argument bar to be of type string (was number)");
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
  it("should validate using regex", function () {
    var input = { foo: "hello" },
      schema = { foo: /^hel+o$/ },
      err = arg.err(input, schema);

    should.not.exist(err);
    (err === null).should.be.true;
  });
  it("should throw correct error for regex validation", function () {
    var input = { foo: "goodbye" },
      schema = { foo: /^hel+o$/ },
      err = arg.err(input, schema);

    err.should.include("expected argument foo to match /^hel+o$/ (was \"goodbye\")");
  });
  it("should assume regex schema elements are string type", function () {
    var input = { foo: 123 },
      schema = { foo: /^hel+o$/ },
      err = arg.err(input, schema);

    err.should.include("expected argument foo to be of type string (was number)");
  });
  it("should accept a third argument for an optional schema", function () {
    var input = { foo: 123, bar: 456 },
      schema = { foo: "number" },
      optSchema = { bar: "string" },
      err = arg.err(input, schema, optSchema);

    should.exist(err);
    err.should.include("expected optional argument bar to be of type string (was number)");
  });
  it("should not give an error for a missing optional arg", function () {
    var input = { foo: 123 },
      schema = { foo: "number" },
      optSchema = { bar: "string" },
      err = arg.err(input, schema, optSchema);

    should.not.exist(err);
    (err === null).should.be.true;
  });
  it("should be able to validate against an array", function () {
    var input = { foo: 123 },
      schema = { foo: ["string", "number"] },
      err = arg.err(input, schema);

    should.not.exist(err);
    (err === null).should.be.true;
  });
  it("should throw an error if an argument doesn't match any of the options", function () {
    var input = { foo: /reg[ex]/ },
      schema = { foo: ["string", "number"] },
      err = arg.err(input, schema);

    should.exist(err);
    err.should.include("expected argument foo to be of type string or number (was regexp)");
  });
  it("should still work if one of the multiple args is an object", function () {
    var input = { foo: /reg[ex]/ },
      schema = { foo: ["string", { bar: "string" }] },
      err = arg.err(input, schema);

    should.exist(err);
    err.should.include("expected argument foo to be of type string or object (was regexp)");
  });
});
