# Spck Module

Spck Module is a lightweight script loading library.

Getting started
---

Spck Module can be installed using bower:

```bash
bower install spck-module
```

Start by including the file in your main HTML file.

```html
<script src="spck-module.js" type="text/javascript"></script>
```

## Defining modules

Modules and can contain definitions of functions and variables, also provides entry point after module
dependencies are loaded.

```javascript
m.module('chicken')
  .import('https://example.com/chicken.css')
  .import('/chicken.js')
  .require('egg')
```

To access the module one can use a function call, or access it through a variable:

```javascript
m.module('chicken')
// which is the same as:
m.modules.chicken
```

## Loading modules
Modules can be loaded and then initialized. A module can be loaded from by using:

```javascript
m.import(url).then(callback);
```

This will append either a `<script>` or `<link>` tag depending on if a '.js' file is included.
When a module is defined, its `__new__` method is automatically immediately called.
Note that `self` refers to the module.

```javascript
m.module('chicken')
  .__new__(function(self) {
    // Do stuff immediately.
    // ...
  });
```
Note that multiple `__new__` callback functions can be defined, and they will be called in the defined order:

```javascript
m.module('chicken')
  .__new__(function(self) {
    console.log('I am first')
  })
  .__new__(function(self) {
    console.log('I am second')
  });
```

## Partial module definition

```javascript
// A module defined again will refer to the original defined module.
// This allows module definitions to be split between many files.
m.module('chicken')
  .__new__(function(self) {
    console.log('I am third');
  });
```

## Initializing modules
After a module is loaded, it needs to be initialized.
Initializing will load all dependencies. The initialization process has 2 steps:

1. Import all files defined by `.import`.
2. After imports are successful, initialize required modules defined by `.require`.

To initialize a module manually:

```javascript
m.module('chicken');
// This can be called anywhere after the module definition.
m.initialize('chicken');
```

To initialize a module as a requirement by another module initialization process:

```javascript
m.module('baby')
  .import('/mother.js')
  .require('mom');
```

When a module is initialized, its `__init__` method is automatically called.
The `__init__` method(s) are called after dependencies are loaded.

```javascript
m.module('baby')
  .__init__(function(self) {
    console.log('I am initialized')
  });
```

Similarly to `__new__`, when defining multiple `__init__` callbacks, they are called in the order of definition.

```javascript
m.module('baby')
  .__init__(function(self) {
    self.count = 5;
  })
  .__init__(function(self) {
    self.count++;
    console.log(self.count); // Outputs 6
  });
```

When a module is initialized, its dependencies will be loaded.

```javascript
m.module('angular-app')
  .import('jquery.min.js')
  .import('angular.min.js')
  .import('https://example.com/script.js');

// Dependencies will be loaded asynchronously (all at the same time).
m.initialize('angular-app');
```

An example on requiring modules.

```javascript
// Inside mother.js
m.module('mom')
  .__init__(function(self) {
    console.log('I will be initialized and loaded FIRST!')
  });

// Inside baby.js
m.module('baby')
  .import('/mother.js')
  .require('mom')

  .__init__(function(self) {
    console.log('I am initialized AFTER mother.')
  });
```

In the case that your submodule has very large dependencies and needs to be loaded in a future point in time:

```javascript
// Inside big-module.js
m.module('big-module')
  .import('very-large-file.js')
  .__init__(function(self) {
    // do stuff
  });

// Inside small-module.js
m.module('small-module')
  .import('/big-module.js')

  .__init__(function(self) {
    // Load big module dependencies after 1s
    setTimeout(function() {
      m.initialize('big-module');
    }, 1000);
  });
```

## Defining module methods

Methods can be defined in a module in the following way:

```javascript
m.module('baby')
  .def({
    laugh: function(self) {
    }),
    talk: function(self, string) {
      self.laugh();
      console.log(string);
    })
  });

m.modules.baby.talk('Awesome!');
```

Note that the methods are defined on the module instance and injected with a `self` argument.
The `self` argument is a reference to the module singleton instance.

## Special properties
Additional properties that are defined on top of module instances.

Property | Description |
--- | --- |
 `__name__` | name of module |
 `__state__` | `loading` / `loaded` / `failed` / `undefined` |

Modules will fail to load if a HTTP error occurs on `import` or a circular dependency is detected on `require`.

## Browser support

![Chrome](https://raw.github.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.github.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.github.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Safari](https://raw.github.com/alrra/browser-logos/master/src/safari/safari_48x48.png) | ![Opera](https://raw.github.com/alrra/browser-logos/master/src/opera/opera_48x48.png)
--- | --- | --- | --- | --- |
Latest ✔ | Latest ✔ | 11+ ✔ | 9.0+ ✔ | Latest ✔ |
