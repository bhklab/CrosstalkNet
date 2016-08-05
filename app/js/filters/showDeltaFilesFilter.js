'use strict';
/**
 * Filter for showing file names beginning with "dLtA"
 * only if the given selected network type is delta.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters').filter('showDeltaFiles', showDeltaFiles);

    /**
     * @desc Filter for hiding files based on selected network type.
     * @memberOf filters
     */
    function showDeltaFiles() {
        return function(files, selectedType) {
            var result = [];

            if (!files) {
                return null;
            }

            if (selectedType == 'delta') {
                for (var i = 0; i < files.length; i++) {
                    if (files[i].name.startsWith("dLtA")) {
                        result.push(files[i]);
                    }
                }
            } else {
                for (var i = 0; i < files.length; i++) {
                    if (!files[i].name.startsWith("dLtA")) {
                        result.push(files[i]);
                    }
                }
            }

            return result;
        };
    }
})();
