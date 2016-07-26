'use strict';
/**
 * Global controls factory. Contains functions that are used for clearing
 * input boxes, used by autocomplete controls, and programatically
 * interacting with controls. The controls may belong to any tab hence
 * the name Global.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('GlobalControls', GlobalControls);

    /**
     * @namespace GlobalControls
     * @desc Factory for manipulating controls.
     * @memberOf services
     */
    function GlobalControls($http, $rootScope, $timeout, GraphConfigService) {
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

        service.startingLayouts = { main: service.layouts.main[1], interactionExplorer: service.layouts.interactionExplorer[0] };

        service.changeDisplay = changeDisplay;
        service.closeEdgeInspector = closeEdgeInspector;
        service.getAllVisibleGenes = getAllVisibleGenes;
        service.resetInputFieldsGlobal = resetInputFieldsGlobal;
        service.resetInputFieldsLocal = resetInputFieldsLocal;
        service.focusElement = focusElement;
        service.clickElement = clickElement;

        service.setMethodsSideBar = setMethodsSideBar;
        service.setMethodsWholeTab = setMethodsWholeTab;

        /**
         * @summary Attaches a group of functions to the given
         * view model. This helps keep controllers slim.
         *
         * @param {Object} vm A view model from a controller.
         */
        function setMethodsSideBar(vm) {
            vm.querySearch = querySearch;
            vm.clearLocatedGene = clearLocatedGene;

            /**
             * @summary Used by autocomplete controls to return a list of filtered results.
             *
             * @param {String} query The value typed into the autocomplete control.
             * @param {String} source A string indicating which autocomplete control 
             * the request is for. Based on this, a different get of genes is used when
             * performing the filtering.
             * @return {Array} An array of gene objects whose value matches query.
             */
            function querySearch(query, source) {
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
            }

            /**
             * @summary Clears the text in the gene locator autocomplete control
             * and removes the styling from the gene that was being located.
             */
            function clearLocatedGene() {
                service.resetInputFieldsLocal(vm.ctrl, 'geneLocator');
                GraphConfigService.clearLocatedGene(vm);
            }

            /**
             * @summary Creates a function that filters an array of genes
             * based on the specified query.
             *
             * @param {String} query The gene name to use when filtering the 
             * the array of genes.
             * @return {Function} A function that will be used to filter an array of genes.
             */
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

        /**
         * @summary Obtains an array of all cytoscape.js nodes that are not 
         * parent nodes from the given cytoscape object.
         *
         * @param {Object} cy A cytoscape object.
         * @return {Array} An array of cytoscape.js nodes that
         * are not parent nodes.
         *
         */
        function getAllVisibleGenes(cy) {
            var result = [];
            var nodes = cy.$('node').not(':parent');

            for (var i = 0; i < nodes.length; i++) {
                result.push(nodes[i].id());
            }

            return result;
        }

        /**
         * @summary Resets all autocomplete controls throughout the app.
         */
        function resetInputFieldsGlobal() {
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

        /**
         * @summary Resets all autocomplete controls within a certain tab.
         *
         * @param {String} tabName The name of a tab. This is used to only 
         * clear the autocomplete controls within that tab.
         */
        function resetInputFieldsLocal(tabName, extraClass) {
            angular.forEach(angular.element("md-autocomplete." + tabName + extraClass + " input"), function(value, key) {
                var a = angular.element(value);
                a.val('');
                if (document.activeElement != null) {
                    document.activeElement.blur();
                }
            });

            angular.forEach(angular.element("md-autocomplete." + tabName + extraClass + " button"), function(value, key) {
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

        /**
         * @summary Sets the focus on the element that 
         * matches the provided selector.
         *
         * @param {String} selector A valid CSS selector used
         * to locate an element.
         */
        function focusElement(selector) {
            $timeout(function() {
                var elem = angular.element(selector);
                elem.focus();
            }, 50);
        }

        /**
         * @summary Clicks the element that 
         * matches the provided selector.
         *
         * @param {String} selector A valid CSS selector used
         * to locate an element.
         */
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
    }
})();
