'use strict';

angular.module('myApp.NeighbourController', ['ngRoute']).controller('NeighbourController', [
    '$scope',
    '$rootScope', 'RESTService',
    'GraphConfigService', 'BasicDataService', '$q', '$timeout',
    function($scope, $rootScope, RESTService, GraphConfigService, BasicDataService, $q, $timeout) {
        $rootScope.selectedTab = 0;
        $scope.selectedItemFirst = null;
        $scope.searchTextFirst = "";
        $scope.searchTextSecond = "";
        $scope.ctrl = "neighbour";

        $rootScope.states = angular.copy(BasicDataService.states);
        $scope.pValues = angular.copy(BasicDataService.pValues);
        $scope.layouts = angular.copy(BasicDataService.layouts);

        $scope.minDegree = {
            first: 0,
            second: 0
        }
        $rootScope.state = $rootScope.states.initial;
        $scope.pValueDisplayed = $scope.pValues[2].value;
        $scope.pValueActual = $scope.pValues[2].value;
        $scope.totalInteractions = null;
        $scope.selfLoops = [];
        $scope.selfLoopsCount = 0;

        $scope.display = "Graph";
        $scope.switchModel = false;
        $scope.selectedLayout = $scope.layouts[1].value;


        $scope.applyConfig = function(config, containerID) {
            $scope.elemCopy = angular.copy(config.elements);
            config.container = document.getElementById(containerID);
            $scope.cy = cytoscape(config);
            $scope.cy.fit($scope.cy.$("*"), 10);
        }

        $scope.changeDisplay = function() {
            if ($scope.display == "Graph") {
                $scope.display = "Self Loops";
            } else {
                $scope.display = "Graph";
            }
        };

        $scope.getSelfLoops = GraphConfigService.getSelfLoops;

        $scope.loadDropdownOptions = BasicDataService.loadDropdownOptions;

        $scope.querySearch = BasicDataService.querySearch;

        $scope.selectedItemChanged = function(item, source) {
            // Run code to select gene here
            // We probably need 2 dropdowns, one for epi and one for stroma or maybe a swtich to indicate which one we are searching
            if (item == null) {
                return;
            }

            var originalElements = GraphConfigService.neighbourConfigs.firstDropdownConfig.elements;
            $rootScope.state = $rootScope.states.loadingSecond;
            RESTService.post('new-neighbour-general', {
                gene: item.value.substring(0, item.value
                    .length - 2).toUpperCase(),
                side: item.value.substring(item.value.length -
                    2),
                originalElements: originalElements,
                pValue: $scope.pValueActual,
                neighbour: 2,
                layout: $scope.selectedLayout,
                first:  GraphConfigService.firstSelectedGene,
                second: item.value.substring(0, item.value
                    .length - 2).toUpperCase()
            }).then(function(data) {
                console.log(data);
                $rootScope.state = $rootScope.states.loadingConfig;
                $scope.neighbours = angular.copy($scope.genesSecond);
                GraphConfigService.neighbourConfigs.secondDropdownConfig = angular
                    .copy(data.config);
                $rootScope.state = $rootScope.states.secondDropdown;
            });
        };

        $scope.resize = GraphConfigService.resetZoom;

        $scope.resetInputFields = function() {
            $("md-autocomplete input").each(function() {
                $(this).val('');
            });
        };

        $scope.resetAllData = function() {
            $scope.neighbours = null;
        };

        $scope.neighbourConfigs = GraphConfigService.neighbourConfigs;

        $scope.$watch('neighbourConfigs.firstDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour");
                $scope.genesFirst = $scope.loadDropdownOptions($scope.cy);
            }
        });

        $scope.$watch('neighbourConfigs.secondDropdownConfig', function(newValue, oldValue) {
            if (newValue != null) {
                $scope.applyConfig(newValue, "cyNeighbour");
            }
        });
    }
]);
