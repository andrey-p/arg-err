/*globals it, describe, beforeEach*/
"use strict";

var arg,
  should = require("should");

describe("config", function () {
  beforeEach(function () {
    arg = require("../index");
  });
  describe("propErr", function () {
    it("should change the phrasing of the error message if true", function () {
      arg.config({ propErr: true });

      var err = arg.err({ foo: "2" }, { foo: "number" });

      err.should.equal("expected property foo to be of type number (was string)");
    });
    it("should leave the message as-is if false", function () {
      arg.config({ propErr: false });

      var err = arg.err({ foo: "2" }, { foo: "number" });

      err.should.equal("expected argument foo to be of type number (was string)");
    });
  });

  it("should return an instance of arg-err to support chaining", function () {
    var arg = require("../index").config({});

    arg.err.should.be.a.Function();
  });
});
