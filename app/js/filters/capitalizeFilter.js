//var filters = angular.module("myApp");
angular.module('myApp.filters').filter('capitalize', function() {
    return function(word) {
    	if (word != null && word.length != 0) {
    		return word.charAt(0).toUpperCase() + word.substr(1);
    	} else {
    		return '';
    	}
    };
});
