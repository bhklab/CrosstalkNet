var myModule = angular.module("myApp.services");
myModule.factory('FileUploadService', function($http, $timeout, $q, Upload, $rootScope, $cookies, RESTService, SharedService, QueryService) {
    var service = {};

    service.uploadFiles = function(files, type) {
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
    };

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

            for (prop in file) {
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
});
