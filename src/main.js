window.m = (function (exports) {
  exports.log = function () {
    if (console && console.log && exports.debug) {
      console.log.apply(console, arguments);
    }
  };

  exports.noop = function () {};

  exports.extend = function (target, source) {
    for (var i in source) {
      if (source.hasOwnProperty(i) && source[i] !== undefined) {
        target[i] = source[i];
      }
    }
    return target;
  };

  exports.alias = function (url, value) {
    var aliases = exports._aliases;
    if (aliases[url]) {
      exports.log("%c" + url + " overridden by " + aliases[url], "color:DodgerBlue;");
    }
    if (value) {
      aliases[url] = value;
    }
    var result = aliases[url] || url;
    return result.indexOf("://") == -1 ? exports.base + result : result;
  };

  exports.import = function (url) {
    url = exports.alias(url);
    return new Promise(function (resolve, reject) {
      if (exports._cache[url]) {
        exports._cache[url].push({ resolve: resolve, reject: reject });
      }
      else {
        exports._cache[url] = [{ resolve: resolve, reject: reject }];
        var noQuery = url.split('?').shift();
        var ext = noQuery.split('.').pop().toLowerCase();
        var tag = ext == 'js' ? 'script' : 'link';
        var props = ext == 'js' ? { src: url } : { href: url };
        var element = document.createElement(tag);

        document.head.appendChild(element);

        element.onload = function () {
          var $this = this;
          exports.log(url, "loaded.");
          exports._cache[url].map(function (resolver) {
            resolver.resolve($this);
          });
        };
        element.onerror = function () {
          exports.log(url, "failed to loaded.");
          exports._cache[url].map(function (resolver) {
            resolver.reject('Failed to load ' + url);
          });
        };
        exports.extend(element, props);
      }
    });
  };

  exports.initialize = function (name) {
    var module = exports.modules[name];

    if (module) {
      return module._initialize();
    }
    else {
      exports.assert(false, "Module " + name + " is not defined!")
    }
  };

  exports.module = function (name) {
    if (!exports.modules[name]) {
      exports.modules[name] = {
        __name__: name,
        __state__: "",

        _scripts: [],
        _modules: [],
        _callbacks: []
      };

      (function (module) {

        module.import = function (url) {
          module._scripts.push(url);
          return module;
        };

        module.require = function (name) {
          module._modules.push(name);
          return module;
        };

        module.def = function (values) {
          exports.extend(module, values);
          return module;
        };

        module.__init__ = function (callback) {
          module._callbacks.push(callback);
          return module;
        };

        module.__new__ = function (callback) {
          callback.call(null, module);
          return module;
        };

        module._initialize = function () {
          return new Promise(function (resolve, reject) {
            var circularDependencyData = checkCircularDependencies(module, [module.__name__]);
            if (circularDependencyData) {
              reject({
                message: 'Circular dependency "' + circularDependencyData[1] + '" found for module "' +  circularDependencyData[0].__name__ + '".'
              });
            }

            switch (module.__state__) {
              case 'loaded':
                resolve(module);
                break;
              case 'failed':
                reject({
                  message: 'Module ' + module.__name__ + ' failed to load.'
                });
                break;
              case 'loading':
                module.__init__(resolve);
                break;
              default:
                exports.log("%c" + name + " loading...", "color:DodgerBlue;");
                module.__state__ = 'loading';
                importScripts(module._scripts)
                  .then(function () {
                    return initializeModules(module._modules)
                      .then(function () {
                        exports.log("%c" + name + " loaded", "font-weight:bold;");
                        module.__state__ = 'loaded';
                        module._callbacks.forEach(function (cb) {
                          cb.call(null, module, exports.modules);
                        });
                        resolve(module);
                      }, function (e) {
                        module.__state__ = 'failed';
                        reject(e);
                      });
                  }, function (e) {
                    module.__state__ = 'failed';
                    reject(e);
                  });
            }
          });
        };

      }(exports.modules[name]));
    }

    return exports.modules[name];

    function checkCircularDependencies(module, seenModules) {
      return module._modules.reduce(function (accumulated, moduleName) {
        if (accumulated) {
          return accumulated;
        } else if (seenModules.indexOf(moduleName) !== -1) {
          return [module, moduleName];
        } else {
          return checkCircularDependencies(exports.modules[moduleName], seenModules.concat([module.__name__]));
        }
      }, null);
    }

    function importScripts(scripts) {
      return Promise.all(scripts.map(exports.import));
    }

    function initializeModules(modules) {
      return Promise.all(modules.map(exports.initialize));
    }
  };

  return exports;
})({ modules: {}, _aliases: {}, _cache: {}, debug: true, base: '' });
