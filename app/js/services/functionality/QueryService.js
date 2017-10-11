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
     *
     * @desc Factory for querying the server for data.
     *
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
        service.deleteMatrixFile = deleteMatrixFile;
        service.getUserPermission = getUserPermission;
        service.getTopGenes = getTopGenes;
        service.createUser = createUser;
        service.deleteUsers = deleteUsers;
        service.getAllUsersNames = getAllUsersNames;
        service.getCommunities = getCommunities;
        service.getCommunityFileList = getCommunityFileList;
        service.uploadCommunityFile = uploadCommunityFile;
        service.deleteCommunityFile = deleteCommunityFile;

        /**
         * @summary Gets a list of genes from the server associated with the
         * currently selected files.
         *
         * @param {Object} files An object containing the files that the user
         * has specified.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         *
         * @memberOf services.QueryService
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
                    deferred.resolve({ geneList: data.geneList, maxDegree: data.maxDegree, rowPost: data.rowPost, 
                        colPost: data.colPost });
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
         *
         * @memberOf services.QueryService
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
         *
         * @memberOf services.QueryService
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
         *
         * @memberOf services.QueryService
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
         *
         * @memberOf services.QueryService
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
         *
         * @memberOf services.QueryService
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
         *
         * @memberOf services.QueryService
         */
        function uploadFiles(files, type, postFixes) {
            var deferred = $q.defer();

            RESTService.post('upload-matrices', { files: files, type: type, postFixes: postFixes })
                .then(function(data) {
                    GlobalSharedData.data.reloadMatrixFileList = true;

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
         *
         * @memberOf services.QueryService
         */
        function deleteMatrixFile(file) {
            RESTService.post('delete-matrix-file', { file: file })
                .then(function(data) {
                    GlobalSharedData.data.reloadMatrixFileList = true;

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
         *
         * @memberOf services.QueryService
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
         *
         * @memberOf services.QueryService
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
         * @summary Sends details to the server that will be used to create new user(s)
         *
         * @param {Array} newUsers An array of objects each of which specify a new user
         * to be created.
         *
         * @memberOf services.QueryService
         */
        function createUser(newUsers) {
            var deferred = $q.defer();

            RESTService.post('create-new-users', { newUsers: newUsers }).then(function(data) {
                ValidationService.checkServerResponse(data);

                if (data.result) {
                    deferred.resolve({ result: data.result });
                }
            });

            return deferred.promise;
        }

        /**
         * @summary Deletes a specified list of users from the server.
         *
         * @param {Array} users An array of strings specifying the names of users to be
         * deleted.
         *
         * @memberOf services.QueryService
         */
        function deleteUsers(users) {
            var deferred = $q.defer();

            RESTService.post('delete-users', { users: users }).then(function(data) {
                ValidationService.checkServerResponse(data);

                if (data.result) {
                    deferred.resolve({ result: data.result });
                }
            });

            return deferred.promise;
        }

        /**
         * @summary Retrieves a list of all user names from the server.
         *
         * @memberOf services.QueryService
         */
        function getAllUsersNames() {
            var deferred = $q.defer();

            RESTService.post('get-all-user-names', {}).then(function(data) {
                ValidationService.checkServerResponse(data);

                if (data.users) {
                    deferred.resolve({ users: data.users });
                }
            });

            return deferred.promise;
        }

        /**
         * @summary Gets the communities for a file specified on the view model
         * from the server.
         *
         * @param {Object} vm The view model for the CEQueryController. This has
         * a selected file in its sdWithinTab.
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getCommunities(file) {
            var deferred = $q.defer();

            RESTService.post('community-explorer', {
                    selectedFile: file
                })
                .then(function(data) {
                    if (!ValidationService.checkServerResponse(data)) {
                        deferred.resolve({ communities: null });
                    }

                    deferred.resolve({ communities: data.communities, config: data.config });
                }, function(response) {
                    console.log(response);
                });

            return deferred.promise;
        }

        /**
         * @summary Gets the list of community files available to the user.
         *
         * @return {Promise} A promise that will be resolved when the request has
         * been completed.
         */
        function getCommunityFileList() {
            var deferred = $q.defer();

            RESTService.post("community-file-list", {}).then(function(data) {
                if (!ValidationService.checkServerResponse(data)) {
                    deferred.resolve({ fileList: null });
                }

                deferred.resolve({ fileList: data.fileList });
            }, function(response) {
                console.log(response);
            });

            return deferred.promise;
        }

        function uploadCommunityFile(file) {
            var deferred = $q.defer();

            RESTService.post("upload-community-file", { file: file }).then(function(data) {
                GlobalSharedData.data.reloadCommunityFileList = true;

                ValidationService.checkServerResponse(data);
                deferred.resolve({ result: null });
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
        function deleteCommunityFile(file) {
            RESTService.post('delete-community-file', { file: file })
                .then(function(data) {
                    GlobalSharedData.data.reloadCommunityFileList = true;

                    if (!ValidationService.checkServerResponse(data)) {
                        return;
                    }
                }, function(response) {
                    console.log(response);
                });
        }

        return service;
    }
})();
