'use strict';
/**
 * Filter for filtering an array of genes based on a minimum degree.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters').filter('degreeFilter', degreeFilter);

    /**
     * @desc Minimum degree filter.
     *
     * @memberOf filters
     */
    function degreeFilter() {
        return function(items, minDegree) {
            var filtered = [];
            angular.forEach(items, function(item) {
                if (item.object.degree >= minDegree) {
                    filtered.push(item);
                }
            });
            return filtered;
        };
    }
})();
