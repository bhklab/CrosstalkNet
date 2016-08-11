'use strict';
/**
 * File uploading factory. Contains functions for reading files from the disk and 
 * uplaoding them to the server.
 * @namespace services
 */
(function() {
    angular.module("myApp.services").factory('FileUploadService', FileUploadService);

    /**
     * @namespace FileUploadService
     * @desc Factory for uploading files to the server.
     * @memberOf services
     */
    function FileUploadService($q, GlobalSharedData, QueryService) {
        var service = {};

        service.uploadMatrixFiles = uploadMatrixFiles;
        service.uploadCommunityFile = uploadCommunityFile;

        /**
         * @summary Checks to see if all files for the selected network
         * type are selected, reads them from the disk, and uploads to the server.
         *
         * @param {Object} files An object containing the files selected by the user.
         * @param {String} type The type of network that the user wants to upload.
         * @return {Promise} A promise to be resolved when the request to the server is 
         * complete.
         */
        function uploadMatrixFiles(files, type) {
            var deferred = $q.defer();
            var filesToUpload = { normal: null, tumor: null, delta: null };

            if (type == 'delta') {
                if (files.delta == null || files.normal == null || files.tumor == null) {
                    alert("Please choose all 3 Rdata files");
                    deferred.resolve({ result: null });
                    return deferred.promise;
                }

                readHelper(files.delta).then(function(result) {
                    filesToUpload.delta = result.file;
                    readHelper(files.normal).then(function(result) {
                        filesToUpload.normal = result.file;
                        readHelper(files.tumor).then(function(result) {
                            filesToUpload.tumor = result.file;

                            QueryService.uploadFiles(filesToUpload, type).then(function(result) {
                                deferred.resolve({ result: null });
                            });
                        });
                    });
                });
            } else {
                readHelper(files[type]).then(function(result) {
                    if (result.file == null) {
                        alert("Please choose an Rdata file");
                        deferred.resolve({ result: null });
                        return deferred.promise;
                    }

                    filesToUpload[type] = result.file;
                    QueryService.uploadFiles(filesToUpload, type).then(function(result) {
                        deferred.resolve({ result: null });
                    });
                });
            }

            return deferred.promise;
        }

        /**
         * @summary Checks to see if a community file is selected,
         * reads it from the disk, and uploads it to the server.
         *
         * @param {Object} file A file selected by the user.
         * @return {Promise} A promise to be resolved when the request to the server is
         * complete.
         */
        function uploadCommunityFile(file) {
            var deferred = $q.defer();

            if (file == null) {
                alert("Please choose an Rdata file.");
                deferred.resolve({ result: null });
                return deferred.promise;
            }

            readHelper(file).then(function(result) {
                if (result.file == null) {
                    alert("Please choose an Rdata file.");
                    deferred.resolve({ result: null });
                    return deferred.promise;
                }

                QueryService.uploadCommunityFile(result.file).then(function(result) {
                    deferred.resolve({ result: null });
                });
            });

            return deferred.promise;
        }

        /**
         * @summary Reads the specified file's contents from the disk
         * and into the browser.
         *
         * @param {File} file The file object representing the file to
         * be read.
         * @return {Promise} A promise to be resolved when the contents of
         * the file are finished being read by the browser.
         */
        function readHelper(file) {
            var deferred = $q.defer();

            if (file == null) {
                deferred.resolve({ file: null });
                return deferred.promise;
            }

            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;
                var fileProperties = {};

                for (var prop in file) {
                    if (prop.indexOf('$') < 0) {
                        fileProperties[prop] = file[prop];
                    }
                }

                fileProperties.data = r.result;

                deferred.resolve({ file: fileProperties });
            }

            r.readAsDataURL(file);

            return deferred.promise;
        }

        return service;
    }
})();
