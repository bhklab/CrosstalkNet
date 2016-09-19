'use strict';

(function() {
    angular.module('myApp.controllers').controller('RouteController', [
        '$location',
        RouteController
    ]);

        /**
     * @namespace RouteController
     * @desc Controller for changing routes.
     * @memberOf controllers
     */
    function RouteController($location) {
        var vm = this;
        vm.ctrl = "route";

        vm.changeRoute = changeRoute;
        vm.showDocumentation = $location.path().endsWith('app');

        /**
         * @summary Changes the route link name in the toolbar
         * from Documentation to App depending on which route is 
         * active.
         *
         * @param {String} route The route that is now active
         */
        function changeRoute(route) {
            if (route == 'app') {
                vm.showDocumentation = true;
                $location.path('/app');
                $location.replace();
            } else if (route == 'documentation') {
                vm.showDocumentation = false;
                $location.path('/documentation');
                $location.replace();
            }
        }
    }
})();
