'use strict';
/**
 * Controller for the LAYOUT sub-tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('IELayoutController', ['$controller',
        IELayoutController
    ]);

    /**
     * @namespace MGLayoutController
     * @desc Controller for the LAYOUT sub-tab.
     * @memberOf controllers
     */
    function IELayoutController($controller) {
        var vm = this;
        angular.extend(this, $controller('LayoutController', {vm: vm}));
    }
})();
