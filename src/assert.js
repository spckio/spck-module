(function (exports) {
  exports.extend(exports, {
    assert: function (cond) {
      if (!cond) {
        if (console && console.error && console.error.apply)
          console.error.apply(console, [].slice.call(arguments).slice(1));
        debugger;
      }
      return cond;
    },
    check: function (obj, schema) {
      if (schema === Object) {
        return exports.assert(exports.isObject(obj),
          'expected Object got ' + Object.prototype.toString.call(obj), obj);
      }
      else if (schema == Array) {
        return exports.assert(exports.isArray(obj),
          'expected Array got ' + Object.prototype.toString.call(obj), obj);
      }
      else if (schema == String) {
        return exports.assert(exports.isString(obj),
          'expected String got ' + Object.prototype.toString.call(obj), obj);
      }
      else if (schema == Boolean) {
        return exports.assert(exports.isBoolean(obj),
          'expected Boolean got ' + Object.prototype.toString.call(obj), obj);
      }
      else if (schema == Number) {
        return exports.assert(exports.isNumber(obj),
          'expected Number got ' + Object.prototype.toString.call(obj), obj);
      }
      else if (schema == Function) {
        return exports.assert(exports.isFunction(obj),
          'expected Function got ' + Object.prototype.toString.call(obj), obj);
      }
      else if (exports.isFunction(schema)) {
        return exports.assert(schema.call(obj, obj),
          'type check function returned false', obj);
      }
      else if (exports.isObject(schema)) {
        var match = exports.check(obj, Object);
        for (var k in schema) {
          // Tricky, put match last to prevent short circuit
          if (schema.hasOwnProperty(k))
            match = exports.check(obj[k], schema[k]) && match;
        }
        return match;
      }
    },
    isArray: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Array]';
    },
    isString: function (obj) {
      return Object.prototype.toString.call(obj) === '[object String]';
    },
    isObject: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Object]';
    },
    isDefined: function (obj) {
      return (Object.prototype.toString.call(obj) !== '[object Null]' &&
        Object.prototype.toString.call(obj) !== '[object Undefined]');
    },
    isNumber: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Number]';
    },
    isBoolean: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Boolean]';
    },
    isFunction: function (obj) {
      return Object.prototype.toString.call(obj) === '[object Function]';
    }
  });
})(window.m);
