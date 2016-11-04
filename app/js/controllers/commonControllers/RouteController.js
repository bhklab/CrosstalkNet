'use strict';

(function() {
    angular.module('myApp.controllers').controller('RouteController', [
        '$location', '$scope', 'GlobalSharedData',
        RouteController
    ]);

    /**
     * @namespace RouteController
     * @desc Controller for changing routes.
     * @memberOf controllers
     */
    function RouteController($location, $scope, GlobalSharedData) {
        var vm = this;
        vm.ctrl = "route";

        vm.sharedData = GlobalSharedData.data;

        vm.changeRoute = changeRoute;
        vm.sharedData.showDocumentation = $location.path().endsWith('app');

        /**
         * @summary Changes the route link name in the toolbar
         * from Documentation to App depending on which route is 
         * active.
         *
         * @param {String} route The route that is now active
         */
        function changeRoute(route) {
            if (route == 'app') {
                vm.sharedData.showDocumentation = true;
                $location.path('/app');
                $location.replace();
            } else if (route == 'documentation') {
                vm.sharedData.showDocumentation = false;
                $location.path('/documentation');
                $location.replace();
            }
        }

        $scope.$on("$locationChangeStart", function(event, next, current) {
            console.info("location changing to:" + next);
            if (next.endsWith('documentation')) {
                vm.sharedData.showDocumentation = false;
            } else if (current.endsWith('app')) {
                vm.sharedData.showDocumentation = true;
            }
        });
    }
})();
