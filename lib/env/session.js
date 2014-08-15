var webdriver = require('selenium-webdriver')
  , config    = require('../../../../config.json')
  , fs = require('fs')
  , path = require('path')
  , driver;

module.exports = {

  create: function () {
    driver = new webdriver.Builder()
      .usingServer(config.seleniumServer)
      .withCapabilities(config.browser)
      .build();
    driver.manage().timeouts().implicitlyWait(10000);
    driver.manage().window().maximize();
  },

  executeInFlow: function (fn, done) {
    webdriver.promise.controlFlow().execute(fn).then(function () {
      done();
    }, done);
  },

  saveScreenshot: function (name) {
    var filename = name.replace(/\W+/g, '-').toLowerCase() + '.png';
    driver.takeScreenshot().then(function (data) {
      fs.writeFileSync(path.join(config.resultsDir, 'screenshots', filename), data, 'base64');
    });
  },

  deleteAllCookies: function () {
    driver.manage().deleteAllCookies();
  },

  getCookie: function (cookieName) {
    return driver.manage().getCookie(cookieName);
  },

  getDriver: function() {
    return driver;
  }

};