'use strict';
/**
 * Controller for the QUERY sub-tab COMMUNITY EXPLORER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('CEQueryController', [
        '$scope',
        '$rootScope',
        'GlobalSharedData', 'QueryService', 'CESharedData',
        CEQueryController
    ]);

    /**
     * @namespace CEQueryController
     * @desc Controller for the QUERY sub-tab in the COMMUNITY EXPLORER tab.
     * @memberOf controllers
     */
    function CEQueryController($scope, $rootScope, GlobalSharedData, QueryService, CESharedData) {
        var vm = this;

        vm.sharedData = GlobalSharedData.data;

        vm.getCommunities = getCommunities;
        vm.initializeController = initializeController;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.CEQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = CESharedData.data;
            initializeVariables();
        }

        /**
         * @summary Initializes variables used within the tab for binding to the controls.
         *
         * @memberOf controllers.CEQueryController
         */
        function initializeVariables() {

        }

        /**
         * @summary Obtains a cytoscape.js config from the server for 
         * the given communities file.
         *
         * @memberOf controllers.CEQueryController
         */
        function getCommunities(filterType) {
            $rootScope.state = $rootScope.states.loadingCommunities;
            CESharedData.resetWTM(vm);
            QueryService.getCommunities(vm).then(function(result) {
                $rootScope.state = $rootScope.states.finishedGettingCommunities;

                if (result.topGenes == null) {
                    return;
                }

                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, result.data.config, "cyCommunityExplorer");

                vm.sdWithinTab.communities = result.communities;
                vm.sdWithinTab.dataLoaded = true;
            });
        }

        /**
         * @summary Watches the clearAllData variable and clears the data within the tab when 
         * it changes to true.
         *
         * @memberOf controllers.CEQueryController
         */
        $scope.$watch(function() {
            return vm.sharedData.clearAllData;
        }, function(newValue, oldValue) {
            if (newValue == true && newValue != oldValue) {
                CESharedData.resetWTM(vm);
                initializeVariables();
            }
        });
    }
})();
