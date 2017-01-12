'use strict';
/**
 * Controller for the LAYOUT sub-tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('MGLayoutController', ['GraphConfigService', 'GlobalControls',
        'MGSharedData',
        MGLayoutController
    ]);

    /**
     * @namespace MGLayoutController
     *
     * @desc Controller for the LAYOUT sub-tab.
     *
     * @memberOf controllers
     */
    function MGLayoutController(GraphConfigService, GlobalControls, MGSharedData) {
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
         * @memberOf controllers.MGLayoutController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = MGSharedData.data;
            vm.layouts = angular.copy(GlobalControls.layouts[vm.ctrl]);
            vm.startingLayout = angular.copy(GlobalControls.startingLayouts[vm.ctrl]);
            vm.sdWithinTab.selectedLayout = vm.layouts[0].value;
        }

        function resetGraph() {
            GraphConfigService.destroyGraph(MGSharedData);

            if (vm.sdWithinTab.config) {
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyMain");    
            }
            
        }
    }
})();
