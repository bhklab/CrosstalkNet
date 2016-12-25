var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/matrix_file_utils');
var async = require('async');

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);
    var file;
    console.log("delete file: %j", req.body.file);

    file = matrixFileUtils.getRequestedFile({ arbitrary: req.body.file }, user)
    
    if (file == null) {
        res.send({ fileStatus: "!!!!Failed to delete file: " })
        return;
    }

    if (file) {
        async.series([
                function(callback) {
                    matrixFileUtils.removeFile(file.path, file, callback);
                }
            ],
            // optional callback
            function(err, results) {
                console.log("results in server.js: %j", results);
                console.log("err: %j", err);
                matrixFileUtils.updateAvailableMatrixCache();

                if (results != null && results.length > 0 && results[0] != null) {
                    res.send({ fileStatus: "Failed to delete file: " + file.name });
                } else {
                    res.send({ fileStatus: "Successfully deleted file" });
                }
            });
    }
}

module.exports = {
    handler: handler
};