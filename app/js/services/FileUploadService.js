var myModule = angular.module("myApp");
myModule.factory('FileUploadService', function($http, Upload) {
    var service = {};

    service.uploadFiles = function(file, errFiles, scope) {
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
                        alert(response);
                    });
                }, function(response) {
                    if (response.status > 0)
                        scope.errorMsg = response.status + ': ' + response.data;
                        alert(response.status + ': ' + response.data);
                }, function(evt) {
                    file.progress = Math.min(100, parseInt(100.0 *
                        evt.loaded / evt.total));
                });
            }

            r.readAsDataURL(file);
        }
    }

    return service;
});
