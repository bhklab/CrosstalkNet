'use strict';
/**
 * Controller for the QUERY sub-tab DEGREE EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('DEQueryController', [
        '$scope',
        '$rootScope', 'RESTService',
        'GraphConfigService', 'GlobalControls', 'ValidationService', 'SharedService', 'QueryService', 'PathExistenceControls', '$q', '$timeout',
        DEQueryController
    ]);

    /**
     * @namespace DEQueryController
     * @desc Controller for the QUERY sub-tab in the DEGREE EXPLORER tab.
     * @memberOf controllers
     */
    function DEQueryController($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, ValidationService, SharedService, QueryService, PathExistenceControls,
        $q, $timeout) {
        var vm = this;

        vm.topXSlider = 1;
        vm.minDegreeSlider = 0;
        vm.sharedData = SharedService.data.global;

        vm.getTopGenes = getTopGenes;
        vm.initializeController = initializeController;
        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.DEQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
        }


        function getTopGenes(filterType) {
            SharedService.resetWTMDE(vm);
            vm.sdWithinTab.filterType = filterType;
            if (filterType == "top") {
                vm.sdWithinTab.filterAmount = vm.topXSlider;
            } else {
                vm.sdWithinTab.filterAmount = vm.minDegreeSlider;
            }
            QueryService.getTopGenes(vm).then(function(result) {
                if (result.topGenes == null) {
                    return;
                }

                vm.sdWithinTab.topGenes = result.topGenes;
                //$rootScope.state = $rootScope.states.finishedGettingAllPaths;
            });
        }

        /**
         * @summary Watches the clearAllData variable and clears the data within the tab when 
         * it changes to true.
         *
         * @memberOf controllers.PEQueryController
         */
        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                SharedService.resetWTMDE(vm);
            }
        });
    }
})();
