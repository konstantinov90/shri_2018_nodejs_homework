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
  baseUrl: 'https://shri-2018-nodejs-homework-prod.herokuapp.com/',
  gridUrl: `http://konstantinov90:${process.env.SAUCELABS_API_KEY}@ondemand.saucelabs.com:80/wd/hub`,
  browsers,
};
