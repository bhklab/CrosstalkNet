var myModule = angular.module("myApp.services");
myModule.factory('FileUploadService', function($http, $timeout, $q, Upload, $rootScope, $cookies, RESTService, SharedService, QueryService) {
    var service = {};

    service.uploadFiles = function(files, type) {
        $rootScope.state = $rootScope.states.uploadingFile;
        var filesToUpload = { normal: null, tumor: null, delta: null };


        if (type == 'delta') {
            if (files.delta == null || files.normal == null || files.tumor == null) {
                return "Please choose all 3 files";
            }

            readHelper(files.delta).then(function(result) {
                filesToUpload.delta = result.file;
                readHelper(files.normal).then(function(result) {
                    filesToUpload.normal = result.file;
                    readHelper(files.tumor).then(function(result) {
                        filesToUpload.tumor = result.file;

                        QueryService.uploadFiles(filesToUpload, type)
                    });
                });
            });

        } else {
            readHelper(files[type]).then(function(result) {
                filesToUpload[type] = result.file;

                QueryService.uploadFiles(filesToUpload, type)
            });
        }
    };

    // function uploadFile(file, type) {
    // 	var uploadFiles = { normal: null, tumor: null, delta: null };

    //     if (file) {
    //         var r = new FileReader();
    //         r.onload = function(e) {
    //             var contents = e.target.result;
    //             var fileProperties = {};

    //             for (prop in file) {
    //                 if (prop.indexOf('$') < 0) {
    //                     fileProperties[prop] = file[prop];
    //                 }
    //             }

    //             fileProperties.data = r.result;
    //             RESTService.post('upload-matrix', { files: fileProperties, token: $cookies.get('token'), type: type })
    //                 .then(function(data) {
    //                     if (!ValidationService.checkServerResponse(data)) {
    //                         return;
    //                     }

    //                     SharedService.data.global.reloadFileList = true;
    //                 }, function(response) {
    //                     console.log(response);
    //                 });
    //         }

    //         r.readAsDataURL(file);
    //     }
    // }

    function readHelper(file) {
        var deferred = $q.defer();

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
