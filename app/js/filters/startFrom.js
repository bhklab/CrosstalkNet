'use strict';
/**
 * Filter to help with pagination.
 * @namespace filters
 */
(function() {
    angular.module("myApp.filters").filter('startFrom', startFrom);

    /**
     * @desc Filter for pagination filter.
     *
     * @memberOf filters
     */
    function startFrom() {
        return function(input, start) {
            if (input) {
                start = +start;
                return input.slice(start);
            }
            return [];
        };
    }
})();
