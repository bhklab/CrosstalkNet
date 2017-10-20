'use strict';
/**
 * Exporting factory. Contains functions that are used to export tables to csv
 * files and graphs to png's.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('ExportService', ExportService);

    /**
     * @namespace ExportService
     *
     * @desc Factory for exporting data to files.
     *
     * @memberOf services
     */
    function ExportService($filter) {
        var service = {};

        service.exportNeighboursToCSV = exportNeighboursToCSV;
        service.exportGraphToPNG = exportGraphToPNG;
        service.exportTopGenesToCSV = exportTopGenesToCSV;
        service.exportAllPathsToCSV = exportAllPathsToCSV;
        service.exportSingleCommunityToCSV = exportSingleCommunityToCSV;
        service.exportAllCommunitiesToCSV = exportAllCommunitiesToCSV;

        /**
         * @summary Exports a specified table of data to a csv file.
         *
         * @param {Object} vm A view model for a controller. This is used
         * to obtain the interactions for that controller.
         * @param {Number} index The level of neighbours that are desired.
         * @param {String} networkType A string indicating whether the network type is
         * weight, normal, or tumor. 
         *
         * @memberOf services.ExportService
         */
        function exportNeighboursToCSV(vm, index, networkType) {
            var fileName = $filter("ordinal")(index + 1) + "neighbours" + Date.now() + ".csv";
            var neighbours = vm.sdWithinTab.neighbours[index];
            var rowDelim = "\r\n";
            var colDelim = ",";
            var csv = "";
            var header = colDelim + neighbours.stroma.map(function(s) {
                return s; //return $filter('suffixTrim')(s);
            }).join();
            csv += header;
            csv += rowDelim;

            for (var i = 0; i < neighbours.epi.length; i++) {
                var temp = [];
                //temp.push($filter('suffixTrim')(neighbours.epi[i]));
                temp.push(neighbours.epi[i]);
                for (var j = 0; j < neighbours.stroma.length; j++) {
                    temp.push(vm.getInteractionViaDictionary(vm, neighbours.epi[i], neighbours.stroma[j], networkType));
                }

                csv += temp.join();
                csv += rowDelim;
            }

            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            downloadFile(fileName, csvData);
        }

        /** 
         * @summary Downloads the currently displayed graph as a png.
         *
         * @param {Object} vm A view model for the current controller
         * that has a cytoscape object in its within-tab shared data.
         *
         * @memberOf services.ExportService
         */
        function exportGraphToPNG(vm) {
            if (vm.sdWithinTab.cy == null) {
                return;
            }

            var fileName = "graph" + Date.now() + ".png";
            var png64 = vm.sdWithinTab.cy.png({ full: true });
            png64 = png64.substring("data:image/png;base64,".length);

            var byteCharacters = atob(png64);

            var byteNumbers = new Array(byteCharacters.length);
            for (var i = 0; i < byteCharacters.length; i++) {
                byteNumbers[i] = byteCharacters.charCodeAt(i);
            }

            var byteArray = new Uint8Array(byteNumbers);

            var blob = new Blob([byteArray], { type: "image/png" });
            var dataURL = URL.createObjectURL(blob);

            downloadFile(fileName, dataURL);
        }

        /** 
         * @summary Downloads the top genes as a csv file.
         *
         * @param {Object} vm A view model for the DegreeExplorerController
         * that has an object of top genes attached to it.
         *
         * @memberOf services.ExportService
         */
        function exportTopGenesToCSV(vm) {
            var rowGenes = vm.sdWithinTab.topGenes.row;
            var colGenes = vm.sdWithinTab.topGenes.col;
            var maxLength = rowGenes.length > colGenes.length ? rowGenes.length : colGenes.length;
            var fileName = "topGenes" + Date.now() + ".csv";
            var rowDelim = "\r\n";
            var colDelim = ",";
            var csv = "";
            var header = vm.sharedData.rowPost + colDelim + vm.sharedData.colPost;
            csv += header;
            csv += rowDelim;

            for (var i = 0; i < maxLength; i++) {
                if (i < rowGenes.length) {
                    csv += $filter('suffixTrim')(rowGenes[i].value) + " " + rowGenes[i].object.degree;
                    csv += colDelim;
                } else {
                    csv += "";
                    csv += colDelim;
                }

                if (i < colGenes.length) {
                    csv += $filter('suffixTrim')(colGenes[i].value) + " " + colGenes[i].object.degree;
                } else {
                    csv += "";
                }

                csv += rowDelim;
            }

            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            downloadFile(fileName, csvData);
        }

        /** 
         * @summary Downloads the list of paths between 2 genes
         *  as a csv file.
         *
         * @param {Object} vm A view model for the PathExistenceController
         * that has an array of all paths attached to it.
         *
         * @memberOf services.ExportService
         */
        function exportAllPathsToCSV(vm, matType) {
            var source = vm.sdWithinTab.pathSourceCached;
            var target = vm.sdWithinTab.pathTargetCached;
            var allPaths = $filter("orderBy")(vm.sdWithinTab.allPaths, vm.sdWithinTab.pagination[matType].query.order);
            var hop = false;
            var fileName = "topGenes" + Date.now() + ".csv";
            var rowDelim = "\r\n";
            var colDelim = ",";
            var csv = "";
            var header = "Source" + colDelim;
            header += "Interaction" + colDelim;

            if (allPaths.length > 0 && allPaths[0].secondEdge) {
                header += "Intermediate Node" + colDelim;
                header += "Interaction" + colDelim;
                hop = true;
            }

            header += "Target";
            csv += header;
            csv += rowDelim;

            for (var i = 0; i < allPaths.length; i++) {
                csv += source + colDelim;
                csv += allPaths[i].firstEdge[matType] + colDelim;
                csv += hop ? allPaths[i].intermediateNode + colDelim : "";
                csv += hop ? allPaths[i].secondEdge[matType] + colDelim : "";
                csv += target + colDelim;

                csv += rowDelim;
            }

            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            downloadFile(fileName, csvData);
        }

        /** 
         * @summary Downloads the list of communities 
         * as a csv file.
         *
         * @param {Object} vm A view model for the CommunityExplorerController
         *
         * @memberOf services.ExportService
         */
        function exportSingleCommunityToCSV(vm) {
            var communities = vm.sdWithinTab.communities;
            var fileName = "communities" + Date.now() + ".csv";
            var rowDelim = "\r\n";
            var colDelim = ",";
            var csv = "";
            var header = "Epi" + colDelim;
            header += "Stroma" + colDelim;
            header += "Community";

            csv += header;
            csv += rowDelim;

            if (vm.sdWithinTab.selectedCom == null || communities[vm.sdWithinTab.selectedCom] == null) {
                var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
                downloadFile(fileName, csvData);
                return;
            }

            var community = communities[vm.sdWithinTab.selectedCom];
            var epi = community.epi;
            var stroma = community.stroma;

            var maxLength = Math.max(epi.length, stroma.length);

            for (var i = 0; i < maxLength; i++) {
                if (i < epi.length) {
                    csv += epi[i]
                }

                csv += colDelim;

                if (i < stroma.length) {
                    csv += stroma[i]
                }

                csv += colDelim;

                csv += vm.sdWithinTab.selectedCom + colDelim;
                csv += rowDelim;
            }

            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            downloadFile(fileName, csvData);
        }

        /**
         * @summary Not yet ready for production.
         */
        function exportAllCommunitiesToCSV(vm) {
            var communities = vm.sdWithinTab.communities;
            var fileName = "communities" + Date.now() + ".csv";
            var rowDelim = "\r\n";
            var colDelim = ",";
            var csv = "";
            var header = "";

            var maxLength = 0;

            var communityNumbers = Object.keys(communities)

            for (var i = 0; i < communityNumbers.length; i++) {
                var length = communities[communityNumbers[i]].epi.length + communities[communityNumbers[i]].stroma.length;

                if (length > maxLength) {
                    maxLength = length;
                }

                header += communityNumbers[i] + colDelim;
            }

            csv += header + rowDelim;

            for (var i = 0; i < maxLength; i++) {

                for (var j = 0; j < communityNumbers.length; j++) {
                    var genes = communities[communityNumbers[j]].epi.concat(communities[communityNumbers[j]].stroma);

                    if (i < genes.length) {
                        csv += genes[i];
                    }

                    csv += colDelim;
                }

                csv += rowDelim;
            }

            var csvData = 'data:application/csv;charset=utf-8,' + encodeURIComponent(csv);
            downloadFile(fileName, csvData);
        }

        /**
         * @summary Creates an anchor element and triggers a
         * download of the specified fileName with the given data.
         *
         * @param {String} fileName A name for the file to be downloaded.
         * @param {String} fileData A String of URI encoded data
         * for the file that will be downloaded.
         *
         * @memberOf services.ExportService
         */
        function downloadFile(fileName, fileData) {
            var link = document.createElement("a");
            link.setAttribute("href", fileData);
            link.setAttribute("download", fileName);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }

        return service;
    }
})();
