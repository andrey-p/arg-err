ARG-ERR
======

Lightweight validator for function arguments

Installing
----

```
$ npm install arg-err
```

You can also add it to a client-side project using Browserify.

Browser support:

[![browser support](https://ci.testling.com/andrey-p/arg-err.png)
](https://ci.testling.com/andrey-p/arg-err)

API
----

### err(argsToTest, schema, [optionalSchema])

Returns `null` if there's no validation errors, otherwise it returns a text description separated by a comma.

Example
----

### Basic usage

```javascript
var arg = require("arg-err");

function frobnicate(args, callback) {
  var err = arg.err(args, {
    foo: "number",
    bar: "string",
    baz: "regexp"
  });

  if (err) {
    return callback(err);
  }
}

frobnicate({
  foo: 123,
  bar: 456
}, function (err) {
  assert.equal(err, "expected argument bar to be of type string (was number), expected argument baz to be of type regexp");
});
```

### Nested schemas and regexes

```javascript
var args = { foo: { bar: 123 }, baz: "bla" },
  err = arg.err(args, {
    foo: { bar: "string" },
    baz: /^qux$/
  });

assert.equal(err, "expected argument foo.bar to be of type string (was number), expected argument baz to match /^qux$/ (was \"bla\")");
```

### Optional arguments

Optional arguments are handled exactly the same as normal ones, except no error is thrown if the property is undefined.

```javascript
var args = { foo: 123, bar: "bla" },
  err = arg.err(args, {
    foo: "number"
  }, {
    bar: "number"
  });

assert.equal(err, "expected optional argument bar to be of type number (was string)");
```

License
----

MIT (see LICENSE.md).
