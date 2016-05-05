'use strict';

// Declare app level module which depends on views, and components
angular.module('myApp', [
  'ngRoute',
  'ngMaterial',
  'myApp.CytoCtrl',
  'myApp.version', 
  'myApp.filters'
]);

var filters = angular.module('myApp.filters', []);