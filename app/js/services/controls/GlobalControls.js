var myModule = angular.module("myApp.services");
myModule.factory('GlobalControls', function($http, $rootScope, $timeout, GraphConfigService, SharedService) {
    var service = {};

    service.pValues = [{ display: "0.001", value: "001" }, { display: "0.01", value: "01" },
        { display: "0.05", value: "05" }, { display: "0.1", value: "1" }
    ];

    service.displayModes = { graph: 'Graph', table: 'Tables' };

    service.layouts = { main: null, interactionExplorer: null };
    service.layouts.main = [{ display: "Bipartite", value: "preset" }, {
        display: "Concentric",
        value: "clustered"
    }, { display: "Random", value: "random" }];

    service.layouts.interactionExplorer = [{ display: "Bipartite", value: "preset" }, { display: "Random", value: "random" }];

    service.startingLayouts = {main: service.layouts.main[1], interactionExplorer: service.layouts.interactionExplorer[0]};

    service.changeDisplay = changeDisplay;
    service.closeEdgeInspector = closeEdgeInspector;
    service.getAllVisibleGenes = getAllVisibleGenes;
    service.resetInputFieldsGlobal = resetInputFieldsGlobal;
    service.resetInputFieldsLocal = resetInputFieldsLocal;
    service.focusElement = focusElement;
    service.clickElement = clickElement;

    service.setMethodsSideBar = setMethodsSideBar;
    service.setMethodsWholeTab = setMethodsWholeTab;

    function setMethodsSideBar(vm) {
        vm.querySearch = function(query, source) {
            var results = [];
            var deferred;

            if (source == "locate") {
                if (vm.allVisibleGenes != null) {
                    results = query ? vm.allVisibleGenes.filter(createFilterFor(query)) :
                        vm.allVisibleGenes,
                        deferred;
                }
            } else if (source == "explorer") {
                if (vm.explorerGenes != null) {
                    results = query ? vm.explorerGenes.filter(createFilterFor(query)) :
                        vm.explorerGenes,
                        deferred;
                }
            } else if (source == "geneList") {
                if (vm.sharedData.geneList != null) {
                    results = query ? vm.sharedData.geneList.filter(createFilterFor(query)) :
                        vm.sharedData.geneList,
                        deferred;
                }
            }

            if (self.simulateQuery) {
                deferred = $q.defer();
                $timeout(function() { deferred.resolve(results); }, Math.random() *
                    1000, false);
                return deferred.promise;
            } else {
                return results;
            }
        };

        vm.clearLocatedGene = function() {
            service.resetInputFieldsLocal(vm, 'geneLocator');
            GraphConfigService.clearLocatedGene(vm);
        };

        function createFilterFor(query) {
            var lowercaseQuery = angular.lowercase(query);
            return function filterFn(gene) {
                if (gene.value != null) {
                    return (angular.lowercase(gene.value).indexOf(lowercaseQuery) === 0);
                } else {
                    return (angular.lowercase(gene).indexOf(lowercaseQuery) === 0);
                }

            };
        }
    }

    function getAllVisibleGenes(vm) {
        var result = [];
        var nodes = vm.sdWithinTab.cy.$('node').not(':parent');

        for (var i = 0; i < nodes.length; i++) {
            result.push(nodes[i].id());
        }

        return result;
    }

    function resetInputFieldsGlobal(vm) {
        angular.forEach(angular.element("md-autocomplete" + " input"), function(value, key) {
            var a = angular.element(value);
            a.val('');
        });

        angular.forEach(angular.element("md-autocomplete" + " button"), function(value, key) {
            $timeout(function() {
                var a = angular.element(value);
                a.click();
                console.log("clicked");
            });
        });
    }

    function resetInputFieldsLocal(vm, extraClass) {
        angular.forEach(angular.element("md-autocomplete." + vm.ctrl + extraClass + " input"), function(value, key) {
            var a = angular.element(value);
            a.val('');
            if (document.activeElement != null) {
                document.activeElement.blur();
            }
        });

        angular.forEach(angular.element("md-autocomplete." + vm.ctrl + extraClass + " button"), function(value, key) {
            $timeout(function() {
                var a = angular.element(value);
                a.click();
                if (document.activeElement != null) {
                    document.activeElement.blur();
                }
            });
        });

        if (document.activeElement != null) {
            document.activeElement.blur();
        }
    }

    function focusElement(selector) {
        $timeout(function() {
            var elem = angular.element(selector);
            elem.focus();
        }, 50);
    }

    function clickElement(selector) {
        $timeout(function() {
            var elem = angular.element(selector);
            elem.click();
        }, 40);
    }

    function closeEdgeInspector(vm) {
        vm.sdWithinTab.selectedEdge = {};
    }

    function changeDisplay(vm) {
        if (vm.sdWithinTab.display == vm.displayModes.graph) {
            vm.sdWithinTab.display = vm.displayModes.table;
        } else {
            vm.sdWithinTab.display = vm.displayModes.graph;
        }
    }

    function setMethodsWholeTab(vm) {

    }

    return service;
});
