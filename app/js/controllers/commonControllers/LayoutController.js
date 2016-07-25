'use strict';
/**
 * Controller for the LAYOUT sub-tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('LayoutController', [
        'vm',
        '$rootScope', 'RESTService',
        'GraphConfigService', 'GlobalControls', 'ValidationService', 'SharedService', 'QueryService', '$q', '$timeout',
        LayoutController
    ]);

    /**
     * @namespace LayoutController
     * @desc Controller for the LAYOUT sub-tab.
     * @memberOf controllers
     */
    function LayoutController(vm, $rootScope, RESTService, GraphConfigService, GlobalControls, ValidationService, SharedService, QueryService,
        $q, $timeout) {
        vm.resize = GraphConfigService.resetZoom;
        vm.initializeController = initializeController;

        /**
         * @summary Assigns the ctrl property of the controller and sets the appropriate within 
         * tab model based on the ctrl property.
         *
         * @param {String} ctrl A name to associate this controller with.
         * @memberOf controllers.LayoutController
         */
        function initializeController(ctrl) {
            vm.ctrl = ctrl;
            vm.sdWithinTab = SharedService.data[vm.ctrl];
            vm.layouts = angular.copy(GlobalControls.layouts[vm.ctrl]);
            vm.startingLayout = angular.copy(GlobalControls.startingLayouts[vm.ctrl]);
            vm.sdWithinTab.selectedLayout = vm.layouts[0].value;
        }
    }
})();
