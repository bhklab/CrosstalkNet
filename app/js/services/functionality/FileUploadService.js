var myModule = angular.module("myApp.services");
myModule.factory('FileUploadService', function($http, $timeout, Upload, $rootScope, $cookies, RESTService) {
    var service = {};

    service.uploadFile = function(file, errFiles, scope) {
        $rootScope.state = $rootScope.states.uploadingFile;
        scope.f = file;
        scope.errFile = errFiles && errFiles[0];

        if (file) {
            var r = new FileReader();
            r.onload = function(e) {
                var contents = e.target.result;

                file.data = r.result;
                file.upload = Upload.upload({
                    url: 'http://localhost:5000/upload-matrix',
                    data: { file: file, data: r.result }
                });

                file.upload.then(function(response) {
                    $timeout(function() {
                        scope.fileList = response.data.fileList;
                        if (response.data.errorStatus == 0) {
                            $rootScope.state = $rootScope.states.finishedUploadingFile;
                        } else {
                            $rootScope.state = $rootScope.states.failedUploadingFile;
                        }
                        alert(response.data.fileStatus);
                    });
                }, function(response) {
                    if (response.status > 0)
                        scope.errorMsg = response.status + ': ' + response.data;
                    $rootScope.state = $rootScope.states.failedUploadingFile;
                    alert(response.status + ': ' + response.data);
                }, function(evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            }

            r.readAsDataURL(file);
        }
    };

    service.uploadFiles = function(files) {
        $rootScope.state = $rootScope.states.uploadingFile;

        for (prop in files) {
            if (files[prop]) {
                uploadHelper(files[prop]);
            }
        }
    };

    function uploadHelper(file) {
        if (file) {
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
                RESTService.post('upload-matrix', { file: fileProperties, token: $cookies.get('token') })
                    .then(function(data) {
                        if (!ValidationService.checkServerResponse(data)) {
                            deferred.resolve({ fileList: null });
                        }

                        deferred.resolve({ fileList: data.fileList });
                    }, function(response) {
                    	console.log(response);
                    });
            }

            r.readAsDataURL(file);
        }
    }


    return service;
});
