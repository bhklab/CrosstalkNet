'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngMaterial',
  'myApp.MainController',
  'myApp.NeighbourController',
  'myApp.version', 
  'myApp.filters'
]);

var filters = angular.module('myApp.filters', []);