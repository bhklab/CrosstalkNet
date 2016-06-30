//var filters = angular.module("myApp");
angular.module('myApp.filters').filter('suffixTrim', function() {
    return function(input) {
        if (input != null) {
            return input.slice(0, -2);

        }

        return "";
    };
});
