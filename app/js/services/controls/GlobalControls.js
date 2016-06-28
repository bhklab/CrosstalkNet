var myModule = angular.module("myApp.services");
myModule.factory('GlobalControls', function($http, $rootScope, $timeout, GraphConfigService, SharedService) {
    var service = {};

    service.states = {
        initial: { id: 0, text: "Waiting for user to query..." },
        loadingGraph: { id: 1, text: "Getting graph from server..." },
        loadingConfig: { id: 2, text: "Initializing graph..." },
        showingGraph: { id: 3, text: "Graph finished" },
        gettingGeneList: { id: 4, text: "Getting gene list..." },
        gettingAllPaths: { id: 5, text: "Getting all paths between source and target genes..." },
        finishedGettingAllPaths: { id: 6, text: "All paths have been obtained" },
        uploadingFile: { id: 7, text: "Uploading file to server..." },
        finishedUploadingFile: { id: 8, text: "Successfully uploaded file to server" },
        failedUploadingFile: { id: 9, text: "Failed to upload file to server" },
    };

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

    service.querySearch = querySearch;
    service.getAllVisibleGenes = getAllVisibleGenes;
    service.resetInputFieldsGlobal = resetInputFieldsGlobal;
    service.resetInputFieldsLocal = resetInputFieldsLocal;
    service.changeDisplay = changeDisplay;
    service.closeEdgeInspector = closeEdgeInspector;

    function changeDisplay(vm) {
        if (vm.sdWithinTab.display == vm.displayModes.graph) {
            vm.sdWithinTab.display = vm.displayModes.table;
        } else {
            vm.sdWithinTab.display = vm.displayModes.graph;
        }
    }

    function querySearch(query, source, scope) {
        var results = [];
        var deferred;

        if (source == "locate") {
            if (scope.allVisibleGenes != null) {
                results = query ? scope.allVisibleGenes.filter(createFilterFor(query)) :
                    scope.allVisibleGenes,
                    deferred;
            }
        } else if (source == "explorer") {
            if (scope.explorerGenes != null) {
                results = query ? scope.explorerGenes.filter(createFilterFor(query)) :
                    scope.explorerGenes,
                    deferred;
            }
        } else if (source == "geneList") {
            if (scope.sharedData.geneList != null) {
                results = query ? scope.sharedData.geneList.filter(createFilterFor(query)) :
                    scope.sharedData.geneList,
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
    }

    function closeEdgeInspector(vm) {
        vm.sdWithinTab.selectedEdge = {};
    }

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

    function getAllVisibleGenes(vm) {
        var result = [];
        var nodes = vm.sdWithinTab.cy.$('node').not(':parent');

        for (var i = 0; i < nodes.length; i++) {
            result.push(nodes[i].id());
        }

        return result;
    }

    function resetInputFieldsGlobal(vm) {
        angular.forEach(angular.element("md-autocomplete." + vm.graphType + " input"), function(value, key) {
            var a = angular.element(value);
            a.val('');
        });

        angular.forEach(angular.element("md-autocomplete." + vm.graphType + " button"), function(value, key) {
            $timeout(function() {
                var a = angular.element(value);
                a.click();
                console.log("clicked");
            });
        });
    }

    function resetInputFieldsLocal(vm, extraClass) {
        angular.forEach(angular.element("md-autocomplete." + vm.graphType + vm.ctrl + extraClass + " input"), function(value, key) {
            var a = angular.element(value);
            a.val('');
            if (document.activeElement != null) {
                document.activeElement.blur();
            }
        });

        angular.forEach(angular.element("md-autocomplete." + vm.graphType + vm.ctrl + extraClass + " button"), function(value, key) {
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

    return service;
});
