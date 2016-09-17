var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var communityFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/community_file_utils');
var async = require('async');

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);
    var file;

    file = communityFileUtils.getRequestedFile(req.body.file, user)

    if (file == null) {
        res.send({ fileStatus: "Failed to delete file" })
        return;
    }

    if (file) {
        async.series([
                function(callback) {
                    communityFileUtils.removeFile(file.path, file, callback);
                }
            ],
            // optional callback
            function(err, results) {
                console.log("results in server.js: %j", results);
                console.log("err: %j", err);
                communityFileUtils.updateAvailableCommunitiesCache();

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