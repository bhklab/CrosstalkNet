//var filters = angular.module("myApp");
angular.module('myApp.filters').filter('suffixTrim', function() {
  return function(input) {
    return input.slice(0, -2);
  };
});