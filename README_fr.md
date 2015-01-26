![Moonraker Logo](https://dl.dropboxusercontent.com/u/6598543/logo-black.png)

Un framework de test web léger et facile à utiliser pour Node. Il a été conçu  pour être rapide et favoriser la maintenabilité et le travail d'équipe.
Il fournit en une fois tout ce dont vous avez besoin - des fonctionnalités/scénarios BDD habituels, une bibliothèque simple de d'objets page, un capacité de parallélisation des tests et des rapports sexy.

Il intègre [Yadda](https://github.com/acuminous/yadda), [Selenium-Webdriver](https://code.google.com/p/selenium/wiki/WebDriverJs), [Mocha](http://mochajs.org/) & [Chai](http://chaijs.com/).


* [Installation](#installation)
* [Configuration](#configuration)
* [Exécution de vos tests](#exécution-de-vos-tests)
* [Projet exemple](#projet-exemple)
* [Ecriture de vos tests](#ecriture-de-vos-tests)
* [Objets page](#objets-page)
* [Components](#components)
* [Assertions](#assertions)
* [CoffeeScript](#coffeescript)
* [Exécution de vos tests en parallèle](#exécution-de-vos-tests-en-parallèle)
* [Génération des rapports](#génération-de-rapports)
* [Référence des objets page](#référence-des-objets-page)
* [Référence des sessions](#référence-des-sessions)
* [A FAIRE](#a-faire)

_note: ceci est la traduction française du [README](./README.md) original_

### Dernière version

La version actuelle de Moonraker est la 0.1.6. Les changements récents comprennent :
* Ajout de la prise en charge de CoffeeScript - les définitions d'étapes / les objets page peuvent être implémentés en utilisant CoffeeScript.


### Installation

Moonraker peut être installé en utilisant [npm](https://www.npmjs.org/) - `$ npm install moonraker` ou en ajoutant `moonraker` dans votre `package.json`.


### Configuration

Moonraker est configuré en utilisant un fichier `config.json` à la racine de votre projet:

```json
{
  "baseUrl": "http://www.laterooms.com",
  "featuresDir": "tests/features",
  "stepsDir": "tests/steps",
  "resultsDir": "results",
  "reporter": "moonraker",
  "threads": 1,

  "testTimeout": 60000,
  "elementTimeout": 5000,

  "browser": {
    "browserName": "chrome",
    "chromeOptions": {
      "args": ["--no-sandbox"]
    }
  }
}
```

* `baseUrl`        - Votre url de base, les urls relatives de vos objets page se baseront sur elle.
* `featuresDir`    - Le chemin d'accès à votre répertoire de fonctionnalités.
* `stepsDir`       - Le chemin d'accès à votre répertoire de définitions d'étapes.
* `resultsDir`     - Le chemin d'accès dans lequel vous souhaitez que vos résultats soient générés.
* `reporter`       - Le type de générateur de rapport que vous souhaitez que Moonraker utilise (plus d'information sur ce sujet [plus bas](#génération-de-rapports)).
* `threads`        - Le nombre de processus que vous souhaitez utiliser pour l'exécution des tests.
* `testTimeout`    - Le délai maximum de test (étape de scénario) au-delà duquel il sera indiqué en échec (ms).
* `elementTimeout` - Le temps maximum pendant lequel selenium essaiera de trouver un élément dans une page. 
* `browser`        - Un objet décrivant les [fonctionnalités souhaitées](https://code.google.com/p/selenium/wiki/DesiredCapabilities) pour votre navigateur.
* `seleniumServer` - Optionel: adresse réseau de votre serveur autonome selenium.

L'exemple de configuration précédent suppose que vous utilisez directement Chrome; pour vous connecter à un serveur selenium distant, ajoutez simplement l'adresse
de votre serveur à votre `config.json`:

`"seleniumServer": "http://127.0.0.1:4444/wd/hub"`.

Toutes les options de configuration de Moonraker peuvent être surchargées pendant l'exécution de vos tests (voir plus loin) en utilisant des paramètres à la ligne de commandes (par ex. : `--baseUrl=http://www.example.com` ou `--browser.browserName=phantomjs`) ou en renseignant des variables d'environnement. Ces configurations ont précédence sur celles de `config.json` dans cet ordre: paramètres de la ligne de commande > variables d'environnement > config.

Vous pouvez également ajouter ce que vous voulez à la configuration et y accéder en utilisant : `var config = require('moonraker').config;`.

### Exécution de vos tests

Pour lancer Moonraker, exécutez `$ node node_modules/moonraker/bin/moonraker.js` ou, pour rendre les choses plus simples, vous pouvez ajouter ce raccourci dans votre `package.json`:

```json
{
  "scripts": {
    "test": "node node_modules/moonraker/bin/moonraker"
  }
}
```
... de telles sorte que vous puissiez simplement exécuter `$ npm test`. Notez que vous ne pouvez pas passer de paramètres en ligne de commande en utilisant le raccourci `$ npm test` shortcut.

### Projet exemple

Vous trouverez un projet exemple complet dans le répertoire `/example` avec tout ce dont vous avez besoin dans une structure projet suggérée pour commencer à utiliser Moonraker - des fonctionnalités, des définitions d'étapes, des objets page et une configuration.

Les tests d'exemple utilisent Chrome donc vous aurez besoin de télécharger la dernière version de [chromedriver](http://chromedriver.storage.googleapis.com/index.html) et de le rendre accessible dans votre path.

### Ecriture de vos tests

Les tests pour Moonraker sont écrits en utilisant [Yadda](https://github.com/acuminous/yadda), une implémentation BDD très semblable à [Cucumber](http://cukes.info/) et en utilisant le framework de test JavaScript [Mocha](http://visionmedia.github.io/mocha/).

Tout comme Cucumber, Yadda relie des étapes écrites en langage naturel à du code, mais peut être plus flexible en ne vous limitant pas à une syntaxe rigide (Etant donné, Quand, Alors / Given, When, Then) mais en vous permettant de définir la vôtre ...

```
Feature: Searching from the homepage

  Scenario: Simple Search

    Given I visit the home page
    When I search for 'Manchester'
    Whatever language I like here
```

```javascript
exports.define = function (steps) {

  steps.given("I visit the home page", function () {
    // some code
  });

  steps.when("I search for '$query'", function (query) {
    // some code
  });

  steps.define("Whatever language I like here", function() {
    // some code
  });

};

```

Bien que Yadda puisse gérer de nombreuses bibliothèques, Moonraker charge actuellement toutes les définitions d'étapes trouvées dans votre répertoire d'étapes dans une seule grosse bibliothèque si bien que, tout comme avec Cucumber, vous devez veiller attentivement à ne pas avoir de conflits dnas les noms d'étapes.

### Objets page 

Moonraker utilise pleinement le pattern des objets page (Page Object) et abstrait les interactions avec les pages pour limiter la duplication de code et rendre les tests faciles à mettre à jour quand l'IHM change.

Pour créer un objet page:

```javascript
// tests/pages/home.js
var Page = require('moonraker').Page;

module.exports = new Page({

  url: { value: '/' },

  txtSearch: { get: function () { return this.element("input[id='txtSearch']"); } },
  btnSearch: { get: function () { return this.element("button[class='btn-primary']"); } },

  searchFor: { value: function (query) {
    this.txtSearch.sendKeys(query);
    this.btnSearch.click();
  }}

});
```

Chaque page possède une url, certains éléments et des méthodes utilitaures dont vous pourriez avoir besoin.

Les éléments sont récupérés en utilisant des sélecteurs css et retourne un web-element selenium avec lesquels on peut interagir [comme à l'acoutumée](https://code.google.com/p/selenium/wiki/WebDriverJs). Une référence complète peut être trouvée [plus loin](#référence-des-objets-page).

Vous pouvez alors utiliser vos objets page dans vos définitions d'étapes:

```javascript
// tests/steps/home-search-steps.js
var homePage = require('../pages/home'),
    searchResults = require('../pages/search-results');

exports.define = function (steps) {

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

```

### Components

Les Components sont exactement comme des objets page et vous permettent de regrouper des éléments dans un composant, puis d'ajouter ce composant lui-même dans un objet page.

```javascript
// tests/pages/components/nav.js
var Component = require('moonraker').Component

module.exports = new Component({

  selLanguage: { get: function () { return this.element('.locale select'); } },
  selCurrency: { get: function () { return this.element('.currency select'); } }

});
```

```javascript
// tests/pages/home.js
var Page = require('moonraker').Page,
    nav = require('./components/nav');

module.exports = new Page({

  url: { value: '/' },
  nav: { get: function () { return this.component(nav, "section[class='header']"); } },
  ...

});
```

Les Components sont ajoutés à une page exactement de la même façon que les éléments mais en utilisant:
`this.component(component, rootNode)` où 'component' est votre objet component et 'rootNode' est un sélecteur css représentant votre noeud racine des composants dans la page.

Tous les éléments de votre composant ont leur portée limitée à ce rootNode si bien que dans l'exemple précédent, l'élément `selLanguage` avec son sélecteur `.locale select` ne sera trouvé que dans l''élément `section[class='header']`.

Votre composant peut ensuite être réutilisé dans vos objets pages et peuvent apparaître à différents endroit de la page.

Utiliser vos composants:

```javascript
// tests/steps/home-search-steps.js
var homePage = require('../pages/home');

exports.define = function (steps) {

  steps.given("I visit the home page", function () {
    homePage.visit();
  });

  steps.when("I select my currency", function () {
    homePage.nav.selCurrency.click();
    // etc..
  });

});

```

### Assertions

Le style 'should' de la bibliothèque d'assertion [Chai](http://chaijs.com/guide/styles/) est utilisable dans vos définitions d'étapes.

### CoffeeScript

Vous pouvez utiliser CoffeeScript pour vos définitions d'étapes et objets page si vous préférez:

```coffee
# /pages/home.coffee
Page = require('moonraker').Page

module.exports = new Page

  url: value: '/'

  txtSearch: get: () -> @element "input[id='txtSearch']"
  btnSearch: get: () -> @element ".btn-primary"

  searchFor: value: (query) ->
    @txtSearch.sendKeys query
    @btnSearch.click()
```

```coffee
# /steps/home-search-steps.coffee
homePage = require '../pages/home'
searchResults = require '../pages/search-results'

exports.define = (steps) ->

  steps.given "I visit the home page", () ->
    homePage.visit()

  steps.when "I search for '$query'", (query) ->
    homePage.txtSearch.sendKeys query
    homePage.btnSearch.click()

  steps.then "I should see '$heading' in the heading", (heading) ->
    searchResults.heading.getText().then (text) ->
      text.should.equal heading
```

### Exécution de vos tests en parallèle

Moonraker a été conçu en ayant la vitesse en tête et gère la parallélisation des tests. Pour tirer avantage de ceci, vous avez simplement besoin d'augmenter le nombre de processus dans la configuration.

Moonraker va répartir vos fichiers de fonctionnalités selon le nombre de processus fixé et démarre un nouveau processus fils (et un nouveau navigateur) pour chaque. Si vous avez 4 fichiers de fonctionnalités et que vous voulez utiliser 2 processus, 2 fonctionnalités seront exécutées par processus / navigateur.

La parallélisation des tests fonctionnent comme attendu avec les connexions des pilotes distants de la même façon que localement. Si vous disposez de ressources matérielles suffisamment puissantes sur lesquelles exécuter vos tests et en plus, une instance d'une grille selenium haute performance sur laquelle ouvrir des connexion, vous pouvez réduire de manière spectaculaire les temps d'exécution de vos tests.

Au mieux, vous ne serez cependant pas plus rapide que votre plus longue exécution de fonctionnalité, donc si vous avez des fonctionnalités comme des tonnes de scénario, vous devriez penser à les répartir dans des fichiers de fonctionnalités plus petits et plus facilement gérables.

### Génération de rapports

Comme les tests sont exécutés en utilisant Mocha, vous pouvez utiliser n'importe lequel des [reporters](http://mochajs.org/#reporters) de Mocha.
Configurez simplement le reporter nécessaire dans la configuration.
Cependant, comme Mocha est conçu pour une exécution en série, vous rencontrerez des problèmes en exécutant Moonraker en parallèle, donc Moonraker fournit avec
son propre reporter adapté pour Mocha.

Pour l'utiliser, configurez le reporter dans votre configuration `moonraker`. Ce reporter comporte une sortie console semblable à celle de Mocha spec et un rapport html est enregistré dans votre répertoire des résultats: 

![rapport Moonraker](https://dl.dropboxusercontent.com/u/6598543/report.png)

Le rapport html comporte les détails de toutes les erreurs et les captures d'écran du navigateur.

### Référence des objets page

Comme le montrent les exemples, toutes les interactions avec les éléments des pages (et le pilote sous-jacent) sont abstraites dans vos objets page. Quand vous créez un objet page, vous disposez de plusieurs façons pour y attacher des éléments de façon à ce que vous puissiez interagir avec eux dans vos définitions d'étapes:

```javascript
var Page = require('moonraker').Page;

module.exports = new Page({

  url: { value: '/search' },

  aTxtInput:  { get: function () { return this.element("input[id='txtSearch']"); } },
  buttons:    { get: function () { return this.elements("button"); } },
  aSelect:    { get: function () { return this.select("select[name='rt-child']"); } },
  aLink:      { get: function () { return this.link("London Hotels"); } },
  aComponent: { get: function () { return this.component(yourComponent, "div[class='container']"); } },

  onLoad: { value: function () {
    // Some code I want to run when the page is loaded.
  } }

});
```

* Configurer une valeur d'url sert au moment d'appeler `visit()` dans votr objet page, par exemple: `examplePage.visit();`. Ces url sont relatives à baseUrl indiquée dans votre config, mais si vous indiquez une url complète telle que `http://www.example.com` baseUrl sera ignoré. De plus, `visit()` accepte un objet requête optionel : `examplePage.visit({ foo: 'bar', baz: 'qux' });` ira sur `http://yourBaseUrl/search?foo=bar&baz=qux`.

* `element(cssSelector)` - est utilisé pour trouver un élément sp"cifique en utilisant un sélecteur css et renvoyé un élément selenium. Par exemple: `examplePage.aTxtInput.click();`

* `elements(cssSelector)` - est utilisé pour trouver tous les éléments qui correspondent à ce sélecteur et renvoyé une collection des éléments selenium. Par exemple:
```javascript
examplePage.buttons.then(function (elems) {
  elems.forEach(function (elem) {
    // etc..
  });
});
```

* `select(cssSelector)` - est identique à `element` mais inclut un utilitaire `selectOption(optionValue)` pour choisir une option selon sa valeur dans vos listes déroulantes. Par exemple: `examplePage.aSelect.selectOption(3);`

* `link(linkText)` - est utilisé pour trouver des liens à l'aidre du texte partiel ou complet du lien. 

* `component(yourComponent, rootNode)` - Attache un composant que vous avez défini à votre page. Voir [components](#components).

Il existe quelques méthodes utilitaires additionnelles que vous pouvez utiliser :

* `title(handler)` - Pour obtenir le titre de la page. Par exemple :
```javascript
examplePage.title(function (t) {
  console.log(t);
});
```

* `waitFor(fn, timeout)` - Expose le `driver.wait` de selenium pour attendre explicitement qu'une condition particulière devienne vraie. Par exemple :
```javascript
search: { value: function (query) {
    var _this = this;
    this.waitFor(function () {
      return _this.aTxtInput.isDisplayed();
    }, 5000);
    this.aTxtInput.sendKeys(query);
} }
```

* `alert()` - Tente de basculer sur la boîte de dialogue d'alerte actuelle. Par exemple : `examplePage.alert.accept();`.
* `onLoad()` - Une fonction optionelle que vous pouvez définir et qui sera exécutée quand la page est chargée.

Les composants sont identiques et ont accès aux mêmes méthodes d'élément mais pas à ceux spécifiques aux pages : `visit()`, `title()`, `alert()` & `component()`.
Voir la documentation officielle de [selenium webdriver](https://code.google.com/p/selenium/wiki/WebDriverJs) pour plus d'information sur la manière de travailler avec les éléments.

### Référence des sessions

Moonraker utilise un objet session pour regrouper les fonctions concernant la session actuelle de test et qui peut être utilisé dans vos définitions d'étapes, etc:
```javascript
var session = require('moonraker').session;
session.resizeWindow(320, 480);
```

* `execute(fn)` - Ajoute n'importe quelle fonction au flux de contrôle du pilote web. Voir [les flux de contrôle](https://code.google.com/p/selenium/wiki/WebDriverJs#Control_Flows).
* `resizeWindow(x, y)` - Redimensionne la fenêtre du navigateur. Par défaut, elle est maximisée.
* `refresh()` - Rafraîchit la page actuelle.
* `saveScreenshot(nom_de_fichier)` - Enregistre une capture d'écran dans `/votreRepertoireResults/screenshots/nom_de_fichier`. Ceci est appelé automatiquement en cas d'échec du test.
* `deleteAllCookies()` - Supprime tous les cookies.
* `addCookie(nom, valeur, domaineFacultatif, cheminAccesFacultatif, estSecuriséFacultati)` - Ajoute un cookie.
* `getCookie(nom)` - Récupère un cookie par son nom.
* `currentUrl(handler)` - Récupère l'url actuelle sous forme d'un objet [url](http://nodejs.org/api/url.html) analysé. Par exemple :
```javascript
session.currentUrl(function (url) {
  console.log(url);
});
```
* `savePerfLog(nom_de_fichier)` - Enregistre les journaux de performance du driver dans `/votreRepertoirResults/perf_logs/nom_de_fichier`. Ceci a été testé avec Chrome pour importer des journaux dans une instance locale de [webpagetest](http://www.webpagetest.org/) pour générer des graphiques cascades de performance, etc.

### A FAIRE 

* D'autres utilitaires pour les éléments - intégration du nouveau module [until](https://github.com/SeleniumHQ/selenium/blob/master/javascript/node/selenium-webdriver/CHANGES.md#v2440) module.
* D'autres exemples de fonctionnalités, d'étapes et de pages.