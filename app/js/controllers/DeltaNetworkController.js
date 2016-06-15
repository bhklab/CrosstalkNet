'use strict';

controllers.controller('DeltaNetworkController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', 'InitializationService', 'ValidationService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, InitializationService, ValidationService,
        $q, $timeout) {
        $rootScope.state = $rootScope.states.initial;
        $rootScope.states = angular.copy(BasicDataService.states);
        $scope.ctrl = "deltaNetwork";

        InitializationService.initializeCommonVariables($scope);

        $scope.genesOfInterest = [];

        $rootScope.$watch('correlationFileActual', function() {
            
        });
    }
]);
