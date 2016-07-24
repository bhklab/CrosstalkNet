'use strict';
/**
 * Controller for the QUERY sub-tab PATH EXISTENCE CHECKER tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('PEQueryController', [
        '$scope',
        '$rootScope', 'RESTService',
        'GraphConfigService', 'GlobalControls', 'ValidationService', 'SharedService', 'QueryService', 'PathExistenceControls', '$q', '$timeout',
        PEQueryController
    ]);

    /**
     * @namespace PEQueryController
     * @desc Controller for the QUERY sub-tab in the PATH EXISTENCE CHECKER tab.
     * @memberOf controllers
     */
    function PEQueryController($scope, $rootScope, RESTService, GraphConfigService, GlobalControls, ValidationService, SharedService, QueryService, PathExistenceControls,
        $q, $timeout) {
        var vm = this;
        vm.scope = $scope;

        vm.initializeController = initializeController;
        vm.refreshPaths = refreshPaths;
        vm.setPathExplorerGene = setPathExplorerGene;

        vm.sharedData = SharedService.data.global;
        PathExistenceControls.setMethods(vm);
        GlobalControls.setMethodsSideBar(vm);

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.PEQueryController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            initializeVariables();
        }

        /**
         * @summary Initializes variables used within the tab for binding to the controls.
         *
         * @memberOf controllers.PEQueryController
         */
        function initializeVariables() {
            vm.pathExplorerSource = null;
            vm.pathExplorerTarget = null;

            vm.pathExplorerTextSource = "";
            vm.pathExplorerTextTarget = "";

            vm.sdWithinTab.allPaths = null;
        }

        /**
         * @summary Sets the path explorer gene source or target based 
         * on the argument indicating the autocomplete box associated
         * with the function call.
         *
         * @param {Object} gene The gene selected from the autocomplete control.
         * @param {String} which An indicator variable used to determine which autocomplete
         * control the selection came from. This in turn is used to decide between assigning
         * either the source or target gene.
         * @memberOf controllers.PEQueryController
         */
        function setPathExplorerGene(gene, which) {
            if (gene != null) {
                if (which == 'source') {
                    vm.pathExplorerSource = gene;
                } else {
                    vm.pathExplorerTarget = gene;
                }
            }
        }

        /**
         * @summary Resets the data shown within the PATH EXISTENCE CHECKER
         * tab and obtains all paths between the currently selected genes from
         * the server.
         *
         * @memberOf controllers.PEQueryController
         */
        function refreshPaths() {
            if (vm.pathExplorerTarget == null || vm.pathExplorerSource == null) {
                alert("Please select a source and target gene.");
                return;
            }

            SharedService.resetWTMPE(vm);
            vm.sdWithinTab.pathTargetCached = vm.pathExplorerTarget.value;
            vm.sdWithinTab.pathSourceCached = vm.pathExplorerSource.value;
            getPathsFromServer();
        }

        /**
         * @summary Obtains all paths between the currently selected genes from the server.
         *
         * @memberOf controllers.PEQueryController
         */
        function getPathsFromServer() {
            QueryService.getAllPaths(vm).then(function(result) {
                if (result.allPaths == null) {
                    return;
                }

                vm.sdWithinTab.allPaths = result.allPaths;
                vm.sdWithinTab.types = result.types;
                $rootScope.state = $rootScope.states.finishedGettingAllPaths;
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
                initializeVariables();
                SharedService.resetWTMPE(vm);
            }
        });
    }
})();
