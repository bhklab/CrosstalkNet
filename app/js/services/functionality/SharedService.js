'use strict';
/**
 * Shared data factory. Contains functions and variable that allow
 * for the sharing of data both between separate controllers within a tab,
 * and also throughout the entire app.
 * @namespace services
 */


(function() {
    angular.module("myApp.services").factory('SharedService', SharedService);

    /**
     * @namespace SharedService
     * @desc Factory for facilitating the sharing of data between controllers.
     * @memberOf services
     */
    function SharedService($http, $timeout, $rootScope, GraphConfigService, ValidationService) {
        var service = {};
        var networkTypes = { normal: 'normal', tumor: 'tumor', delta: 'delta' };
        var correlationFileModel = { normal: null, tumor: null, delta: null };
        // Object containing different variables to be available between all controllers in the app.
        var globalDataModel = {
            reloadFileList: false,
            correlationFileActual: angular.copy(correlationFileModel),
            geneList: null,
            matrixSummary: null,
            selectedNetworkType: networkTypes.tumor,
            clearAllData: false,
            networkTypes: networkTypes,
            guest: false
        };

        service.data = { global: angular.copy(globalDataModel) };

        // Object representing the different states that the app can be in.
        service.states = {
            initial: { id: 0, text: "Waiting for user to query..." },
            showingGraph: { id: 1, text: "Graph finished" },
            finishedGettingAllPaths: { id: 2, text: "All paths have been obtained" },
            finishedUploadingFile: { id: 3, text: "Successfully uploaded file to server" },
            failedUploadingFile: { id: 4, text: "Failed to upload file to server" },
            loadingGraph: { id: 5, text: "Getting graph from server..." },
            loadingConfig: { id: 6, text: "Initializing graph..." },
            gettingGeneList: { id: 7, text: "Getting gene list..." },
            gettingAllPaths: { id: 8, text: "Getting all paths between source and target genes..." },
            uploadingFile: { id: 9, text: "Uploading file to server..." }
        };

        $rootScope.states = angular.copy(service.states);
        $rootScope.state = service.states.initial;

        /** Object representing variables to be available between the various controllers within
         * a certain tab. This is used for the MAIN GRAPH tab and the INTERACTION EXPLORER tab.
         */
        var withinTabModelGraph = {
            cy: null,
            display: null,
            neighbours: null,
            selectedLayout: null,
            graphSummary: null,
            selfLoops: null,
            selectedTab: 0,
            showGraphSummary: false,
            selectedEdge: null,
            selfLoopSearch: ""
        };

        // Object representing the default columns to sort by in the PATH EXISTENCE CHECKER tab.
        var tableOrderModel = { weight: "-'firstEdge.weight'", normal: "-'firstEdge.normal'", tumor: "-'firstEdge.tumor'" };
        /** Object representing variables to be available between the various controllers
         * within the PATH EXISTENCE CHECKER tab.
         */
        var withinTabModelPE = { pathSourceCached: null, pathTargetCached: null, allPaths: null, display: null, types: null, tableOrder: angular.copy(tableOrderModel) };

        service.data.main = angular.copy(withinTabModelGraph);
        service.data.interactionExplorer = angular.copy(withinTabModelGraph);
        service.data.pathExistence = angular.copy(withinTabModelPE);
        service.resetWTM = resetWTM;
        service.resetWTMPE = resetWTMPE;
        service.resetCorrelationFiles = resetCorrelationFiles;
        service.resetMatrixSummary = resetMatrixSummary;
        service.resetGeneList = resetGeneList;
        service.resetGlobalData = resetGlobalData;

        /**
         * @summary Resets the within tab variables for a given view model. 
         * This is used for the MAIN GRAPH tab and the INTERACTION EXPLORER tab.
         *
         * @param {Object} vm A view model whose within-tab shared data will
         * be reset to the initial state.
         *
         */
        function resetWTM(vm) {
            for (var prop in withinTabModelGraph) {
                if (prop != "display" && prop != "selectedTab" && prop != "selectedLayout") {
                    vm.sdWithinTab[prop] = withinTabModelGraph[prop];
                }
            }
        }

        /**
         * @summary Resets the within tab variables for a given view model.
         * This is used for the PATH EXISTENCE CHECKER tab.
         * 
         * @param {Object} vm A view model whose within-tab shared data will
         * be reset to the initial state.
         */
        function resetWTMPE(vm) {
            for (var prop in withinTabModelPE) {
                if (prop == "tableOrder") {
                    vm.sdWithinTab[prop] = angular.copy(tableOrderModel);
                } else if (prop != "display") {
                    vm.sdWithinTab[prop] = withinTabModelPE[prop];
                }
            }
        }

        /**
         * @summary Resets the global variable representing the currently selected
         * files to the initial empty state.
         */
        function resetCorrelationFiles() {
            service.data.global.correlationFileActual = angular.copy(correlationFileModel);
        }

        /**
         * @summary Resets the global variable representing the overall matrix
         * summary for the currently selected files to the initial empty state.
         */
        function resetMatrixSummary() {
            service.data.global.matrixSummary = null;
        }

        /**
         * @summary Resets the global variable representing the gene list for
         * the currently selected files to the initial empty state.
         */
        function resetGeneList() {
            service.data.global.geneList = null;
        }

        /**
         * @summary Resets all relevant global data to the initial state.
         */
        function resetGlobalData() {
            service.data.global.clearAllData = true;
            resetCorrelationFiles();
            resetMatrixSummary();
            resetGeneList();
        }

        return service;
    }
})();
