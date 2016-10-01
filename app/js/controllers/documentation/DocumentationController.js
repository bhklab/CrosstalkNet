'use strict';

(function() {
    angular.module('myApp.controllers').controller('DocumentationController', [
        '$location', '$scope', 'GlobalSharedData',
        DocumentationController
    ]);

        /**
     * @namespace DocumentationController
     * @desc Controller for changing routes.
     * @memberOf controllers
     */
    function DocumentationController($location, $scope, GlobalSharedData) {
        var vm = this;
        vm.ctrl = "route";

        vm.sharedData = GlobalSharedData.data;

        vm.changeRoute = changeRoute;
        vm.showDocumentation = $location.path().endsWith('app');

        /**
         * @summary Changes the route link name in the toolbar
         * from Documentation to App depending on which route is 
         * active.
         *
         * @param {String} route The route that is now active
         */
        function changeRoute() {
            vm.sharedData.showDocumentation = true;
        }
    }
})();
