module.exports = {
  baseUrl: 'http://localhost:9000',
  gridUrl: 'http://localhost:4444/wd/hub',
  browsers: {
    iphone: {
      desiredCapabilities: {
        browserName: 'iphone'
      }
    }
  }
}