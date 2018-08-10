module.exports = function (config) {
  config.set({

    basePath: './',

    logLevel: config.LOG_DEBUG,

    files: [
      'src/main.js',
      'src/**/*.js',
      'tests/**/*.spec.js'
    ],

    exclude: [
    ],

    reporters: ['progress', 'coverage'],

    preprocessors: {
      'src/modules/*.js': ['coverage'],
      'src/*.js': ['coverage']
    },

    // web server port
    port: 9877,

    singleRun: true,

    autoWatch: false,

    frameworks: ['jasmine'],

    browsers: ['PhantomJS'],

    plugins: [
      'karma-jasmine',
      'karma-phantomjs-launcher',
      'karma-coverage'
    ]
  });
};
