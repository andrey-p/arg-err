ARG-ERR
======

Lightweight validator for function arguments

Usage
----

```javascript
var arg = require("arg-err");

function demo(args, callback) {
  var err = arg.err(args, {
    foo: "number",
    bar: "string",
    baz: "regexp"
  });

  if (err) {
    return callback(err);
    // err:
    // expected argument bar to be of type string (was number)
    // expected argument baz to be of type regexp
  }
}

demo({
  foo: 123,
  bar: 456
});
```
