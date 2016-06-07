'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngMaterial',
  'ngFileUpload',
  'myApp.MainController',
  'myApp.NeighbourController',
  'myApp.filters'
]);

var filters = angular.module('myApp.filters', []);