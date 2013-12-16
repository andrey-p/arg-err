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
  });
  it("should give an error for invalid args", function () {
    var input = { foo: "2" },
      err = arg.err(input, { foo: "number" });

    should.exist(err);
  });
  it("should give the error in the expected format", function () {
    var input = { foo: "2" },
      err = arg.err(input, { foo: "number" });

    err.should.equal("expected argument foo to be of type number (was string)");
  });
  it("should give multiple errors on multiple lines", function () {
    var input = { foo: "2", bar: 123 },
      err = arg.err(input, { foo: "number", bar: "string" });

    err.should.equal("expected argument foo to be of type number (was string)\nexpected argument bar to be of type string (was number)");
  });
});
