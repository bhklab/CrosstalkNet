'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngMaterial',
  'ngCookies',
  'ngFileUpload',
  'md.data.table',
  'myApp.controllers',
  'myApp.directives',
  'myApp.filters',
  'myApp.services',
]).config(function($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('light-blue', {
      'default': 'A700', // by default use shade 400 from the pink palette for primary intentions
      'hue-1': '100', // use shade 100 for the <code>md-hue-1</code> class
      'hue-2': '600', // use shade 600 for the <code>md-hue-2</code> class
      'hue-3': 'A700' // use shade A100 for the <code>md-hue-3</code> class
    })
    .accentPalette('orange');
});

angular.module('myApp.directives', []);
angular.module('myApp.filters', []);
angular.module('myApp.controllers', []);
angular.module('myApp.services', []);
angular.module('myApp.mainGraph', []);