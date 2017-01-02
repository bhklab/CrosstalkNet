'use strict';
/**
 * Filter for capitalizing the first letter of words.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters')
        .filter('capitalize', capitalize);

    /**
     * @desc Capitalization filter.
     *
     * @memberOf filters
     */
    function capitalize() {
        return function(word) {
            if (word != null && word.length != 0) {
                return word.charAt(0).toUpperCase() + word.substr(1);
            } else {
                return '';
            }
        };
    }
})();
