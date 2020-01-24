const fs = require('fs');
require('core-js-builder')({
  modules: [],
  blacklist: [],                  // blacklist of modules / namespaces, by default - empty list
  library: false,                 // flag for build without global namespace pollution, by default - false
  umd: true                       // use UMD wrapper for export `core` object, by default - true
}).then(function (code) {
  fs.writeFileSync('./src/vendor/core.js', code)
}).catch(function (error) {
  console.log(error);
});
