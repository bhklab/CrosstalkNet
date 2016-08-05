'use strict';
/**
 * Filter for capitalizing removing the prefix "dLtA" from
 * file names.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters')
        .filter('removeDeltaPrefix', removeDeltaPrefix);

    /**
     * @desc File name trimming filter.
     * @memberOf filters
     */
    function removeDeltaPrefix() {
        return function(fileName) {
            return fileName.replace('dLtA', '');
        };
    }
})();
