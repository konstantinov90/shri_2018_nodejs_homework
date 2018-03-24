const { type } = require('os');

const browsers = {
  firefox: {
    desiredCapabilities: {
      browserName: 'firefox',
    },
  },
  chrome: {
    desiredCapabilities: {
      browserName: 'chrome',
    },
  },
};

if (type().startsWith('Windows')) {
  browsers.ie = {
    desiredCapabilities: {
      browserName: 'internet explorer',
    },
  };
}

module.exports = {
  baseUrl: 'http://localhost:9999',
  gridUrl: 'http://localhost:4444/wd/hub',
  browsers,
};
