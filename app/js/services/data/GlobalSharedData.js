'use strict';
/**
 * Shared data factory. Contains functions and variable that allow
 * for the sharing of data both between separate controllers within a tab,
 * and also throughout the entire app.
 * @namespace services
 */


(function() {
    angular.module("myApp.services").factory('GlobalSharedData', GlobalSharedData);

    /**
     * @namespace GlobalSharedData
     * @desc Factory for facilitating the sharing of data between controllers.
     * @memberOf services
     */
    function GlobalSharedData($rootScope) {
        var service = {};
        var networkTypes = { normal: 'normal', tumor: 'tumor', delta: 'delta' };
        var correlationFileModel = { normal: null, tumor: null, delta: null };
        // Object containing different variables to be available between all controllers in the app.
        var globalDataModel = {
            reloadCommunityFileList: false,
            reloadMatrixFileList: false,
            correlationFileActual: angular.copy(correlationFileModel),
            geneList: null,
            maxDegree: 0,
            matrixSummary: null,
            selectedNetworkType: networkTypes.tumor,
            clearAllData: false,
            networkTypes: networkTypes,
            guest: false, 
            permission: 0
        };

        service.data = angular.copy(globalDataModel);

        service.geneCardURL = "http://www.genecards.org/cgi-bin/carddisp.pl?gene=";

        // Object representing the different states that the app can be in.
        service.states = {
            initial: { id: 0, text: "Waiting for user to query..." },
            showingGraph: { id: 1, text: "Graph finished" },
            finishedGettingAllPaths: { id: 2, text: "All paths have been obtained" },
            finishedUploadingFile: { id: 3, text: "Successfully uploaded file to server" },
            failedUploadingFile: { id: 4, text: "Failed to upload file to server" },
            finishedGettingTopGenes: {id: 5, text: "Top genes have been obtained"},
            loadingGraph: { id: 6, text: "Getting graph from server..." },
            loadingConfig: { id: 7, text: "Initializing graph..." },
            gettingGeneList: { id: 8, text: "Getting gene list..." },
            gettingAllPaths: { id: 9, text: "Getting all paths between source and target genes..." },
            uploadingFile: { id: 10, text: "Uploading file to server..." },
            loadingDegreeExplorer: {id: 11, text: "Getting top genes from the server..."}
        };

        $rootScope.states = angular.copy(service.states);
        $rootScope.state = service.states.initial;

        service.resetCorrelationFiles = resetCorrelationFiles;
        service.resetMatrixSummary = resetMatrixSummary;
        service.resetGeneList = resetGeneList;
        service.resetGlobalData = resetGlobalData;

        /**
         * @summary Resets the global variable representing the currently selected
         * files to the initial empty state.
         */
        function resetCorrelationFiles() {
            service.data.correlationFileActual = angular.copy(correlationFileModel);
        }

        /**
         * @summary Resets the global variable representing the overall matrix
         * summary for the currently selected files to the initial empty state.
         */
        function resetMatrixSummary() {
            service.data.matrixSummary = null;
        }

        /**
         * @summary Resets the global variable representing the gene list for
         * the currently selected files to the initial empty state.
         */
        function resetGeneList() {
            service.data.geneList = null;
        }

        /**
         * @summary Resets all relevant global data to the initial state.
         */
        function resetGlobalData() {
            service.data.clearAllData = true;
            resetCorrelationFiles();
            resetMatrixSummary();
            resetGeneList();
        }

        return service;
    }
})();
