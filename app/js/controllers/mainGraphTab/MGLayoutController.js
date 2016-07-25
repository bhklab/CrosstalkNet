'use strict';
/**
 * Controller for the LAYOUT sub-tab.
 * @namespace controllers
 */
(function() {
    angular.module('myApp.controllers').controller('MGLayoutController', ['$controller',
        MGLayoutController
    ]);

    /**
     * @namespace MGLayoutController
     * @desc Controller for the LAYOUT sub-tab.
     * @memberOf controllers
     */
    function MGLayoutController($controller) {
        var vm = this;
        angular.extend(this, $controller('LayoutController', {vm: vm}));
    }
})();
