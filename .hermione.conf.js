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

let baseUrl, gridUrl;

if (process.env.HERMIONE === 'local') {
  baseUrl = 'http://localhost:9999';
  gridUrl = 'http://localhost:4444/wd/hub';
} else {
  baseUrl = 'https://shri-2018-nodejs-homework-test.herokuapp.com/';
  gridUrl = `http://konstantinov90:${process.env.SAUCELABS_API_KEY}@ondemand.saucelabs.com:80/wd/hub`;
}

const plugins = {
  'html-reporter/hermione': {
    path: 'hermione-html-report',
  },
};

module.exports = { baseUrl, gridUrl, browsers, plugins };
