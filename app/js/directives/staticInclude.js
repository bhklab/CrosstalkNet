'use strict';
/**
 * Directive for statically including HTML templates.
 * @namespace directives
 */
(function() {
    angular.module("myApp.directives")
           .directive('staticInclude', staticInclude);

    function staticInclude($http, $templateCache, $compile) {
        return {
            restrict: 'AE',
            templateUrl: function(ele, attrs) {
                return attrs.staticInclude;
            }
        };
    }
})();
