'use strict';
/**
 * Controller for the LAYOUT sub-tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('CELayoutController', ['CESharedData',
        'GlobalControls', 'GraphConfigService',
        CELayoutController
    ]);

    /**
     * @namespace CELayoutController
     *
     * @desc Controller for the LAYOUT sub-tab.
     *
     * @memberOf controllers
     */
    function CELayoutController(CESharedData, GlobalControls, GraphConfigService) {
        var vm = this;
        vm.resetZoom = GraphConfigService.resetZoom;
        vm.initializeController = initializeController;
        vm.resetGraph = resetGraph;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         *
         * @memberOf controllers.CELayoutController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = CESharedData.data;
        }

        function resetGraph() {
            GraphConfigService.destroyGraph(CESharedData);
            
            if (vm.sdWithinTab.config) {
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyCommunityExplorer");    
            }
        }
    }
})();
