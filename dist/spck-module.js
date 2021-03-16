window.m = (function (root) {
  "use strict";
  root.log = function () {
    if (console && console.log && root.debug) {
      console.log.apply(console, arguments);
    }
  };

  root.noop = function () {};

  root.extend = function (target, source) {
    for (var i in source) {
      if (source.hasOwnProperty(i) && source[i] !== undefined) {
        target[i] = source[i];
      }
    }
    return target;
  };

  root.alias = function (url, value) {
    var aliases = root._aliases;
    if (aliases[url]) {
      root.log("%c" + url + " overridden by " + aliases[url], "color:DodgerBlue;");
    }
    if (value) {
      aliases[url] = value;
    }
    var result = aliases[url] || url;
    return result.indexOf("://") == -1 ? root.base + result : result;
  };

  root.import = function (url) {
    url = root.alias(url);
    return new Promise(function (resolve, reject) {
      if (root._cache[url]) {
        root._cache[url].push({ resolve: resolve, reject: reject });
      }
      else {
        root._cache[url] = [{ resolve: resolve, reject: reject }];
        var noQuery = url.split('?').shift();
        var ext = noQuery.split('.').pop().toLowerCase();
        var tag = ext == 'js' ? 'script' : 'link';
        var props = ext == 'js' ? { src: url } : { href: url };
        var element = document.createElement(tag);

        document.head.appendChild(element);

        element.onload = function () {
          var $this = this;
          root.log(url, "loaded.");
          root._cache[url].map(function (resolver) {
            resolver.resolve($this);
          });
        };
        element.onerror = function () {
          root.log(url, "failed to loaded.");
          root._cache[url].map(function (resolver) {
            resolver.reject('Failed to load ' + url);
          });
        };
        root.extend(element, props);
      }
    });
  };

  root.initialize = function (name) {
    var mod = root.modules[name];
    if (mod) {
      return mod.initialize();
    } else {
      root.assert(false, 'When initializing "' + name + '": module "' + name + '" is not defined!')
    }
  };

  root.module = function (name) {
    if (!root.modules[name]) {
      root.modules[name] = {
        $loaded: false,
        __name__: name,
        __state__: "",

        _scripts: [],
        _modules: [],
        _callbacks: []
      };

      (function (mod) {

        mod.import = function (url) {
          mod._scripts.push(url);
          return mod;
        };

        mod.require = function () {
          Array.from(arguments).forEach(function (name) {
            if (name !== null) {
              mod._modules.push(name);
            }
          })
          return mod;
        };

        mod.def = function (values) {
          root.extend(mod, values);
          return mod;
        };

        mod.__init__ = function (callback) {
          mod._callbacks.push(callback);
          return mod;
        };

        mod.__new__ = function (callback) {
          callback.call(null, mod);
          return mod;
        };

        mod.initialize = function () {
          return new Promise(function (resolve, reject) {
            var circularDependencyData = checkCircularDependencies(mod, [mod.__name__]);
            if (circularDependencyData) {
              reject({
                message: 'Circular dependency "' + circularDependencyData[1] + '" found for module "' +  circularDependencyData[0].__name__ + '".'
              });
            }

            switch (mod.__state__) {
              case 'loaded':
                resolve(mod);
                break;
              case 'failed':
                reject({
                  message: 'Module ' + mod.__name__ + ' failed to load.'
                });
                break;
              case 'loading':
                mod.__init__(resolve);
                break;
              default:
                root.log("%c" + name + " loading...", "color:DodgerBlue;");
                mod.__state__ = 'loading';
                importScripts(mod._scripts)
                  .then(function () {
                    return initializeModules(mod._modules)
                      .then(function () {
                        root.log("%c" + name + " loaded", "font-weight:bold;");
                        mod.$loaded = true;
                        mod.__state__ = 'loaded';
                        mod._callbacks.forEach(function (cb) {
                          cb.call(null, mod, root.modules);
                        });
                        resolve(mod);
                      }, function (e) {
                        mod.__state__ = 'failed';
                        reject(e);
                      });
                  }, function (e) {
                    mod.__state__ = 'failed';
                    reject(e);
                  });
            }
          });
        };

      }(root.modules[name]));
    }

    return root.modules[name];

    function checkCircularDependencies(mod, seenModules) {
      return mod._modules.reduce(function (accumulated, moduleName) {
        if (accumulated) {
          return accumulated;
        } else if (seenModules.indexOf(moduleName) !== -1) {
          return [mod, moduleName];
        } else {
          var submodule = root.modules[moduleName]
          if (submodule) {
            return checkCircularDependencies(submodule, seenModules.concat([mod.__name__]));
          } else {
            root.assert(false, 'When initializing "' + mod.__name__ + '": module "' + moduleName + '" is not defined!')
          }
        }
      }, null);
    }

    function importScripts(scripts) {
      return Promise.all(scripts.map(root.import));
    }

    function initializeModules(modules) {
      return Promise.all(modules.map(root.initialize));
    }
  };

  return root;
})({ modules: {}, _aliases: {}, _cache: {}, debug: true, base: '' });

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
