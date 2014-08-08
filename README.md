## Moonraker

A lightweight BDD style web testing framework for node, with Yadda, Selenium-Webdriver, page objects and support for parallel testing.

### Install

To use this framework you need to add this to your `package.json`:

```json
"dependencies": {
  "private-repo": "git+ssh://git@github.com:LateRoomsGroup/moonraker.git"
},
"scripts": {
  "test": "node node_modules/moonraker/bin/moonraker.js"
}
```

...and then `$ npm install`.

### Configuration

Moonraker is configured using a `config.json` file in your project root to setup the baseUrl, feature/step directory paths and browser instance etc:

```json
{
  "baseUrl": "http://www.laterooms.com",
  "featuresDir": "tests/features",
  "stepsDir": "tests/steps",
  "resultsDir": "results",
  "reporter": "spec",
  "threads": 1,

  "browser": {
    "browserName": "chrome",
    "chromeOptions": {
      "args": ["--test-type"]
    }
  }
}
```

The directory paths are used to tell Yadda where to find your feature and step definition (library) files. The browser object is used to setup the selenium driver and can be used like any selenium ['Desired Capabilities'](https://code.google.com/p/selenium/wiki/DesiredCapabilities).

This example assumes using Chrome directly, to connect to a remote selenium server, just add your server address to the config:
`"seleniumServer": "http://127.0.0.1:4444/wd/hub"`.

### Example project

You will find a full example test project in the `/example` folder with everything you need to start using Moonraker - sample feature/scenario, page objects and config.json in a suggested project structure.

`$ npm test` to run Moonraker. The example tests use Chrome, so you will need the latest [chromedriver](http://chromedriver.storage.googleapis.com/index.html) downloaded and available on your path.

### Yadda

Tests for Moonraker are written using [Yadda](https://github.com/acuminous/yadda), a BDD implementation very similar to [Cucumber](http://cukes.info/) and run using the [Mocha](http://visionmedia.github.io/mocha/) JavaScript test framework.

Just like Cucumber, Yadda maps ordinary language steps to code, but can be quite flexible by not limiting you to a certain syntax (Given, When, Then) and allowing you to define your own...

```
Feature: Searching from the homepage

  Scenario: Simple Search

    Given I visit the home page
    When I search for 'Manchester'
    Then I should see 'Manchester Hotels' in the heading
    Whatever language I like here
```

```javascript
var define = function (steps) {

  steps.given("I visit the home page", function () {
    // some code
  });

  steps.when("I search for '$query'", function (query) {
    // some code
  });

  steps.then("I should see '$heading' in the heading", function (heading) {
    // some code
  });

  steps.define("Whatever language I like here", function() {
    // some code
  });

};

exports.define = define;
```

Although Yadda can support multiple libraries, Moonraker currently loads all step definitions found in your steps directory into one big shared library, just like Cucumber, so you have to be careful of step name clashes.

### Page objects

Moonraker makes full use of the Page Object pattern to model and abstract interactions with pages to reduce duplicated code and make tests easy to update as/when the UI changes.

To create a page object:

```javascript
// tests/pages/home.js

var Page = require('moonraker').Page;

module.exports = Page.create({

  url: { value: '/' },

  txtSearch: { get: function () { return this.element("input[id='txtSearch']"); } },
  btnSearch: { get: function () { return this.element("button[class='btn-primary']"); } },

  searchFor: { value: function (query) {
    this.txtSearch.sendKeys(query);
    this.btnSearch.click();
  }}

});
```

Each page has a url, some elements and any convenient methods that may be required. Like the home page example, urls should be relative to your 'baseUrl' set in the config, but 'external' pages can also be used by using the full url.

Elements are found by css selector and return a selenium web-element which can be interacted with as [per usual](https://code.google.com/p/selenium/wiki/WebDriverJs).

You can then use your page objects in your step definitions:

```javascript
// tests/steps/home-search-steps.js

var homePage = require('../pages/home');
var searchResults = require('../pages/search-results');

var define = function (steps) {

  steps.given("I visit the home page", function () {
    homePage.visit();
  });

  steps.when("I search for '$query'", function (query) {
    homePage.txtSearch.sendKeys(query);
    homePage.btnSearch.click();
    // Or use homePage.searchFor(query);
  });

  steps.then("I should see '$heading' in the heading", function (heading) {
    searchResults.heading.getText().then(function (text) {
      text.should.equal(heading);
    });
  });

};

exports.define = define;
```

### Components

Components are exactly like page objects and allow you to group elements together into a component, then add that component to a page object.

```javascript
// tests/pages/components/nav.js

var Component = require('moonraker').Component

module.exports = Component.create({

  selLanguage: { get: function () { return this.element('.locale select'); } },
  selCurrency: { get: function () { return this.element('.currency select'); } }

});
```

```javascript
// tests/pages/home.js

var Page = require('moonraker').Page;
var nav = require('./components/nav');

module.exports = Page.create({

  url: { value: '/' },

  nav: { get: function () { return this.component(nav, "section[class='header']"); } },

  ...

});
```

Components are added to a page just like elements are but using:
`this.component(component, rootNode)` where 'component' is your component object, and 'rootNode' is a css selector representing your components root node on the page.
All elements in your component are then scoped to this rootNode, so in the above example the element `selLanguage` with its `.locale select` selector is only found within the `section[class='header']` element.

Your components can then be re-used across your page-objects and could appear in different places on the page.

Using your components:

```javascript
// tests/steps/home-search-steps.js

var homePage = require('../pages/home');

var define = function (steps) {

  steps.given("I visit the home page", function () {
    homePage.visit();
  });

  steps.when("I select my currency", function () {
    homePage.nav.selCurrency.click();
    // etc..
  });

  ...

```

### Running in parallel

To speed up your test runs Moonraker supports running in parallel. This is done at the feature level and to use it you only need to increase the number of 'threads' in the config.

Moonraker simply splits your feature files over the amount of threads set and starts a Mocha child process (and browser) for each. If you have 4 feature files and want to use 2 threads, 2 features will be executed per thread/browser etc.

Note - Mocha's standard reporters do not work correctly in parallel, but Moonraker's included 'html' reporter does.

### Assertions

Moonraker uses the 'should' style of the [Chai](http://chaijs.com/guide/styles/) assertion library.

### Reporting

As the tests are run using Mocha, you can use any of Mocha's [reporters](http://visionmedia.github.io/mocha/#reporters).
Just set the required reporter in the config. Moonraker also comes with a 'html' reporter (as Mocha's only works when run in the browser) that also works correctly when running in parallel.

The html reporter mimics Mocha's and includes details of any errors and browser screen shots.
