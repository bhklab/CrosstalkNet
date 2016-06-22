'use strict';

controllers.controller('DeltaNetworkController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService,
        $q, $timeout) {
        $scope.ctrl = "deltaNetwork";

        InitializationService.initializeCommonVariables($scope);

        $scope.genesOfInterest = [];

        $rootScope.$watch('correlationFileActual', function() {
            
        });
    }
]);
