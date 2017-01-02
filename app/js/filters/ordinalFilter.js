'use strict';
/**
 * Filter for turning numbers into their corresponding ordinal number.
 * @namespace filters
 */
(function() {
    angular.module('myApp.filters').filter('ordinal', ordinal);

    /**
     * @desc Ordinal number filter.
     *
     * @memberOf filters
     */
    function ordinal() {
        return function(number) {
            if (isNaN(number) || number < 1) {
                return number;
            } else {
                var lastDigit = number % 10;
                if (lastDigit === 1) {
                    return number + 'st'
                } else if (lastDigit === 2) {
                    return number + 'nd'
                } else if (lastDigit === 3) {
                    return number + 'rd'
                } else if (lastDigit > 3) {
                    return number + 'th'
                }
            }
        }
    }
})();
