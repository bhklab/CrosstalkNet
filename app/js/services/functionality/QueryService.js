'use strict';
/**
 * Server querying factory. Contains functions that query the server
 * for data.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('QueryService', QueryService);

    /**
     * @namespace QueryService
     * @desc Factory for querying the server for data.
     * @memberOf services
     */
    function QueryService($q, $rootScope, RESTService, ValidationService, GlobalSharedData) {
        var service = {};

        service.getGeneList = getGeneList;
        service.getFileList = getFileList;
        service.getMatrixSummary = getMatrixSummary;
        service.getMainGraph = getMainGraph;
        service.getInteractionExplorerConfig = getInteractionExplorerConfig;
        service.getAllPaths = getAllPaths;
        service.uploadFiles = uploadFiles;
        service.deleteFile = deleteFile;
        service.getUserPermission = getUserPermission;
        service.getTopGenes = getTopGenes;
        service.getCommunities = getCommunities;

        /**
         * @summary Gets a list of genes from the server associated with the
         * currently selected files.
         *
         * @param {Object} files An object containing the files that the user
         * has specified.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getGeneList(files) {
            $rootScope.state = $rootScope.states.gettingGeneList;
            var deferred = $q.defer();

            RESTService.post('gene-list', { selectedFile: files })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ geneList: null, maxDegree: 0 });
                    }

                    $rootScope.state = $rootScope.states.initial;
                    deferred.resolve({ geneList: data.geneList, maxDegree: data.maxDegree });
                });
            return deferred.promise;
        }

        /**
         * @summary Gets a list of files available to the current user 
         * from the server.
         *
         * @param {Array} types An array of strings denoting what type of files
         * (normal, tumor, or delta) should be returned.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getFileList(types) {
            var deferred = $q.defer();

            RESTService.post('available-matrices', { types: types })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ fileList: null });
                    }

                    deferred.resolve({ fileList: data.fileList });
                });
            return deferred.promise;
        }

        /**
         * @summary Gets the overll matrix summary associated with the
         * files specified by the user from the server.
         *
         * @param {Object} files An object containing the files that the user
         * has specified.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getMatrixSummary(files) {
            var deferred = $q.defer();

            RESTService.post('overall-matrix-stats', { selectedFile: files }).then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ matrixSummary: null });
                }

                deferred.resolve({ matrixSummary: data.overallMatrixStats });
            });
            return deferred.promise;
        }

        /**
         * @summary Gets the graph config associated with the query from the MAIN GRAPH 
         * tab from the server.
         * 
         * @param {Object} vm The view model for the MGQueryController. This contains
         * the selected genes, which level of neighbours to obtain the config for, and
         * so on.
         * @param {Boolean} filter A flag used to determine whether or not the result
         * should be filtered by correlation.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getMainGraph(vm, filter) {
            var deferred = $q.defer();
            var filterFirst = false;
            var filterSecond = false;
            var depth = 1;
            $rootScope.state = $rootScope.states.loadingGraph;

            if (vm.GOIState == vm.GOIStates.filterFirst) {
                if (filter == false) {
                    depth = 2;
                }
                filter = true;
                filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
            } else if (vm.GOIState == vm.GOIStates.getSecondNeighbours) {
                filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
                filterSecond = vm.correlationFilterSecond.negativeEnabled || vm.correlationFilterSecond.positiveEnabled;
                depth = 2;
            } else if (vm.GOIState == vm.GOIStates.filterSecond) {
                filterFirst = vm.correlationFilterFirst.negativeEnabled || vm.correlationFilterFirst.positiveEnabled;
                filterSecond = vm.correlationFilterSecond.negativeEnabled || vm.correlationFilterSecond.positiveEnabled;
                depth = 2;
            }

            RESTService.post("main-graph", {
                    selectedGenes: vm.genesOfInterest,
                    minNegativeWeightFirst: vm.correlationFilterFirst.negativeFilter ==
                        null || !vm.correlationFilterFirst.negativeEnabled ?
                        "NA" : vm.correlationFilterFirst.negativeFilter,
                    minPositiveWeightFirst: vm.correlationFilterFirst.positiveFilter ==
                        null || !vm.correlationFilterFirst.positiveEnabled ?
                        "NA" : vm.correlationFilterFirst.positiveFilter,
                    minNegativeWeightSecond: vm.correlationFilterSecond.negativeFilter ==
                        null || !vm.correlationFilterSecond.negativeEnabled ?
                        "NA" : vm.correlationFilterSecond.negativeFilter,
                    minPositiveWeightSecond: vm.correlationFilterSecond.positiveFilter ==
                        null || !vm.correlationFilterSecond.positiveEnabled ?
                        "NA" : vm.correlationFilterSecond.positiveFilter,
                    selectedFilterFirst: { negative: vm.correlationFilterFirst.negativeEnabled, positive: vm.correlationFilterFirst.positiveEnabled },
                    selectedFilterSecond: { negative: vm.correlationFilterSecond.negativeEnabled, positive: vm.correlationFilterSecond.positiveEnabled },
                    filterFirst: filterFirst && filter,
                    filterSecond: filterSecond && filter,
                    layout: vm.sdWithinTab.selectedLayout,
                    depth: depth,
                    selectedFile: vm.sharedData.correlationFileActual,
                    selectedNetworkType: vm.sharedData.selectedNetworkType
                })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ data: null });
                    }

                    deferred.resolve({ data: data, depth: depth });
                });

            return deferred.promise;
        }

        /**
         * @summary Gets the graph config associated with the query from the
         * INTERACTION EXPLORER tab.
         *
         * @param {Object} vm The view model for the IEQueryController. This contains
         * the selected genes for which to obtain the config.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getInteractionExplorerConfig(vm) {
            var deferred = $q.defer();
            var level = vm.genesOfInterest.length;
            $rootScope.state = $rootScope.states.loadingGraph;
            RESTService.post('interaction-explorer', {
                layout: vm.sdWithinTab.selectedLayout,
                selectedGenes: vm.genesOfInterest,
                selectedFile: vm.sharedData.correlationFileActual,
                selectedNetworkType: vm.sharedData.selectedNetworkType
            }).then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ data: null });
                }

                deferred.resolve({ data: data, level: level });
            });

            return deferred.promise;
        }

        /**
         * @summary Gets the list of all paths for specified genes in the
         * given view model from the server.
         *
         * @param {Object} vm The view model for the PEQueryController. This contains
         * the source and target genes for which to obtain the paths.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getAllPaths(vm) {
            var deferred = $q.defer();

            $rootScope.state = $rootScope.states.gettingAllPaths;

            RESTService.post('get-all-paths', {
                target: vm.pathExplorerTarget.value,
                source: vm.pathExplorerSource.value,
                selectedFile: vm.sharedData.correlationFileActual,
                selectedNetworkType: vm.sharedData.selectedNetworkType
            }).then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ allPaths: null });
                }

                deferred.resolve({ allPaths: data.paths, types: data.types });
            });

            return deferred.promise;
        }

        /**
         * @summary Uploads a set of files for a specified type
         * of network to the server.
         *
         * @param {Object} files A object containing files and their contents.
         * @param {String} type A string representing whether the network is
         * normal, tumor, or delta.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function uploadFiles(files, type) {
            var deferred = $q.defer();

            RESTService.post('upload-matrix', { files: files, type: type })
                .then(function(data) {
                    GlobalSharedData.data.reloadFileList = true;

                    ValidationService.checkServerResponse(data);
                    deferred.resolve({ result: null });

                }, function(response) {
                    console.log(response);
                });

            return deferred.promise;
        }

        /**
         * @summary Deletes the specified file from the server.
         *
         * @param {Obeject} file The file to be deleted from the server.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function deleteFile(file) {
            RESTService.post('delete-file', { file: file })
                .then(function(data) {
                    GlobalSharedData.data.reloadFileList = true;

                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }
                }, function(response) {
                    console.log(response);
                });
        }

        /**
         * @summary Gets the user's permission level from the server.
         *
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getUserPermission() {
            var deferred = $q.defer();

            RESTService.post('get-user-permission', {})
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ permission: null });
                    }

                    deferred.resolve({ permission: data.permission });
                }, function(response) {
                    console.log(response);
                });

            return deferred.promise;
        }

        /**
         * @summary Gets the top genes based on their degree from the server.
         *
         * @param {Object} vm The view model for the DEQueryController. This contains
         * filter amount and filter type to be used by the server.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getTopGenes(vm) {
            var deferred = $q.defer();

            RESTService.post('min-degree-genes', {
                    selectedFile: vm.sharedData.correlationFileActual,
                    filterAmount: vm.sdWithinTab.filterAmount,
                    filterType: vm.sdWithinTab.filterType
                })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ topGenes: null });
                    }

                    deferred.resolve({ topGenes: data.topGenes });
                }, function(response) {
                    console.log(response);
                });

            return deferred.promise;
        }

        /**
         * @summaryt Gets the communities for a file specified on the view model
         * from the server.
         *
         * @param {Object} vm The view model for the CEQueryController. This has
         * a selected file in its sdWithinTab.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getCommunities(vm) {
            var deferred = $q.defer();

            RESTService.post('community-explorer', {
                    selectedFile: vm.sdWithinTab.communitiesFile
                })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ topGenes: null });
                    }

                    deferred.resolve({ communities: data.communities, config: data.config });
                }, function(response) {
                    console.log(response);
                });

            return deferred.promise;

        }

        return service;
    }

})();
