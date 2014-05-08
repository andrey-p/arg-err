ARG-ERR
======

Lightweight validator for function arguments

Installing
----

```
$ npm install arg-err
```

API
----

### err(argsToTest, schema)

Returns `null` if there's no validation errors, otherwise it returns a text description separated by a comma.

Example
----

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

`arg-err` supports nested schemas and regexes too:

```javascript
var args = { foo: { bar: 123 }, baz: "bla" },
  err = arg.err(args, {
    foo: { bar: "string" },
    baz: /^qux$/
  });

assert.equal(err, "expected argument foo.bar to be of type string (was number), expected argument baz to match /^qux$/ (was \"bla\")");
```

License
----

MIT (see LICENSE.md).
