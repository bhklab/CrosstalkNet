'use strict';
/**
 * Filter for trimming the suffix from a gene name 
 * that has -E or -S appended to it.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters').filter('suffixTrim', suffixTrim);

    /**
     * @desc Suffix trimming filter.
     *
     * @memberOf filters
     */
    function suffixTrim() {
        return function(input) {
            if (input != null) {
                return input.split("-")[0];

            }

            return "";
        };
    }
})();
