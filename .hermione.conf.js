module.exports = {
  baseUrl: 'http://localhost:5000',
  gridUrl: 'http://localhost:4444/wd/hub',
  browsers: {
    chrome: {
      desiredCapabilities: {
        browserName: 'chrome',
      },
    },
    // firefox: {
    //   desiredCapabilities: {
    //     browserName: 'firefox'
    //   }
    // }
  }
}