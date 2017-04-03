'use strict';
/**
 * Controller for the LAYOUT sub-tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('IELayoutController', ['IESharedData',
        'GlobalControls', 'GraphConfigService',
        IELayoutController
    ]);

    /**
     * @namespace IELayoutController
     *
     * @desc Controller for the LAYOUT sub-tab.
     *
     * @memberOf controllers
     */
    function IELayoutController(IESharedData, GlobalControls, GraphConfigService) {
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
         * @memberOf controllers.IELayoutController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = IESharedData.data;
            vm.layouts = angular.copy(GlobalControls.layouts[vm.ctrl]);
            vm.startingLayout = angular.copy(GlobalControls.startingLayouts[vm.ctrl]);
            vm.sdWithinTab.selectedLayout = vm.layouts[0].value;
        }

        function resetGraph() {
            GraphConfigService.destroyGraph(IESharedData);
            
            if (vm.sdWithinTab.config) {
                vm.sdWithinTab.cy = GraphConfigService.applyConfig(vm, vm.sdWithinTab.config, "cyInteractionExplorer");    
            }
        }
    }
})();
