'use strict';
/**
 * Server response validation factory. Contains functions for 
 * checking responses from the server and seeing whether
 * or they contain error messages.
 * @namespace services
 */

(function() {
    angular.module("myApp.services").factory('ValidationService', ValidationService);

    /**
     * @namespace ValidationService
     * @desc Factory for checking for errors in server responses.
     * @memberOf services
     */
    function ValidationService($rootScope, $cookies, $interval) {
        var service = {};
        var reset = 3;
        service.checkServerResponse = checkServerResponse;




        /**
         * @summary Checks to see if a server response has
         * an error message attatched to it. If so, it prints
         * that error message to the user.
         *
         * @param {Object} data The data associated with the reponse
         * to a REST call.
         *
         */
        function checkServerResponse(data) {
            if (data.error) {
                if (reset == 3) {
                    alert(data.error);
                    console.log("ERROR");
                    $interval(function() { reset++; }, 1000, 3);
                }

                
                return false;
            } else if (data.login == false) {
                if (reset == 3) {
                    alert(data.message);
                    reset = 0;
                    $interval(function() { reset++; }, 1000, 3);

                    if ($rootScope.tokenSet == true) {
                        $rootScope.tokenSet = false;
                    }
                }
            } else if (data.fileStatus) {
                alert(data.fileStatus);
            } else {
                return true;
            }
        }

        return service;
    }
})();
