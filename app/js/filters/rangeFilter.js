'use strict';
/**
 * Filter for creating a range of numbers to iterate over.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters').filter('range', range);

    /**
     * @desc Range creating filter.
     * @memberOf filters
     */
    function range() {
        return function(input, total) {
            total = parseInt(total);

            for (var i = 0; i <= total; i++) {
                input.push(i);
            }

            return input;
        };
    }
})();
