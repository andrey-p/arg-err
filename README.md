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

Returns `null` if there's no validation errors, otherwise it returns a text description separated by a newline.

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
  assert.equal(err, "expected argument bar to be of type string (was number)\nexpected argument baz to be of type regexp");
});
```

License
----

MIT (see LICENSE.md).
