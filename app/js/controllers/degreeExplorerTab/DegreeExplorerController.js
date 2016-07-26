'use strict';
/**
 * Controller for the DEGREE EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('DegreeExplorerController', [
        '$scope', '$window', '$filter', 'GlobalSharedData', 'DESharedData',
        DegreeExplorerController
    ]);

    /**
     * @namespace DegreeExplorerController
     * @desc Controller for the DEGREE EXPLORER tab.
     * @memberOf controllers
     */
    function DegreeExplorerController($scope, $window, $filter, GlobalSharedData, DESharedData) {
        var vm = this;
        vm.sharedData = GlobalSharedData.data;

        vm.initializeController = initializeController;
        vm.goToGeneCard = goToGeneCard;
        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.DegreeExplorerController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = DESharedData.data;
        }

        function goToGeneCard(gene) {
            $window.open(GlobalSharedData.geneCardURL + $filter('suffixTrim')(gene.value));
        }
    }
})();
