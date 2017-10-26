'use strict';
/**
 * Split a string based on a character and return only a certain part of the splitted result.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters').filter('split', split);

    /**
     * @desc String splitting filter.
     *
     * @memberOf filters
     */
    function split() {
        return function(str, split, index) {
            var temp = str.split(split);

            return temp[index];
        }
    }
})();
