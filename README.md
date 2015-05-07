logwrap.js
==========

Verbose logger module to debug classes in node.js and your browser.



Why?
----

Debugging complex classes with `console.log` feels wrong.



Installation
------------

    npm install [--save-dev] logwrap



Examples
-------------------

**Debugging classes:**
```javascript
var logwrap = require('logwrap');

function MyClass () { /*...*/ }
MyClass.prototype.myMethod = function (a, b, c) { /*...*/ };

var instance = new MyClass();
logwrap.debugClass(MyClass); // enable debugging
instance.myMethod(1, 2, 3); // logs to console
logwrap.debugClass(MyClass, false); // disable debugging
```

**Debugging functions:**
```javascript
var logwrap = require('logwrap');

function complexFunctionA (arg1, arg2) { /*...*/ };
complexFunctionB = function (argA, argB) { /*...*/ };

complexFunctionA = logwrap.wrapFunction(complexFunctionA);
complexFunctionB = logwrap.wrapFunction(complexFunctionB, 'complexFunctionB');

complexFunctionA(3.14159, 47); // logs to console
complexFunctionB('Apple', 'Banana'); // logs to console

```
