'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngMaterial',
  'myApp.MainController',
  'myApp.version', 
  'myApp.filters'
]);

var filters = angular.module('myApp.filters', []);