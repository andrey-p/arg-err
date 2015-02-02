var browsers = {
  sl_chrome: {
    base: 'SauceLabs',
    browserName: 'chrome',
    platform: 'Windows 7',
    version: '35'
  },
  sl_firefox: {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '30'
  },
  sl_ios_safari: {
    base: 'SauceLabs',
    browserName: 'iphone',
    platform: 'OS X 10.9',
    version: '7.1'
  },
  sl_ie_11: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 8.1',
    version: '11'
  },
  sl_ie_6: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows XP',
    version: '6'
  },
  sl_ie_7: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows XP',
    version: '7'
  },
  sl_ie_8: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows XP',
    version: '8'
  },
  sl_ie_9: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '9'
  },
  sl_ie_10: {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    platform: 'Windows 7',
    version: '10'
  }
};

module.exports = function(config) {
  config.set({
    logLevel: 'LOG_DEBUG',
    reporters: ['saucelabs', 'spec'],
    singleRun : true,
    autoWatch : false,
    frameworks: [
      'mocha',
      'browserify'
    ],
    files: [
      'test/*.js'
    ],
    preprocessors: {
      'test/*.js': ['browserify']
    },
    browserify: {
      debug: true
    },
    browsers: Object.keys(browsers),
    customLaunchers: browsers
  });
};
