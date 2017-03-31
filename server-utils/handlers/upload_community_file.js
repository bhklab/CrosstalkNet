'use strict'

var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var communityFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/community_file_utils');
var async = require('async');
var exec = require('child_process').exec;

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);
    var file = req.body.file;

    if (user == null) {
        res.send({ error: "Upload failed. Failed to authenticate user." })
        return;
    }

    if (file == null || file.name == null || file.data == null) {
        res.send({ error: "Upload failed. File name or data missing." })
        return;
    }

    async.series([function(callback) {
        file.data = file.data.replace(/^data:;base64,/, "");
        communityFileUtils.createDirectory(communityFileUtils.BASE_UPLOAD_DIRECTORY, user.name, callback);
        communityFileUtils.writeFile(communityFileUtils.BASE_UPLOAD_DIRECTORY, file, user.name, callback);
    }, function(callback) {
        verifyFile("r_scripts/community_file_checker.R", communityFileUtils.BASE_UPLOAD_DIRECTORY + user.name + "/", file.name, callback);
    }], function(result) {
        console.log(result);

        if (result.status != null) {
            communityFileUtils.removeFile(communityFileUtils.BASE_UPLOAD_DIRECTORY + user.name + "/", file, null);
            console.log("Failed file verification.");
            res.send({ fileStatus: "Failed to upload file(s). " + result.message, errorStatus: result.status });
            return;
        } else {
            console.log("Wrote file: " + file.name + " to disk");
			res.send({ fileStatus: "Successfully uploaded file. Please check the dropdown to select new file(s). " })
        }

        communityFileUtils.updateAvailableCommunitiesCache();
    });

    // async.series([function(callback) {

    // }], function(result) {
    //     if (result != null) {
    //         communityFileUtils.removeFile(communityFileUtils.BASE_UPLOAD_DIRECTORY + user.name + "/", file, null);
    //         console.log("Failed file verification.");
    //         res.send({ fileStatus: "Failed to upload file(s). " + result.message, errorStatus: result.status });
    //     } else {
    //         console.log("File verification successful.");
    //         res.send({ fileStatus: "Successfully uploaded file. Please check the dropdown to select new file(s). " })
    //     }

    //     communityFileUtils.updateAvailableCommunitiesCache();
    // });
}

function verifyFile(script, filePath, fileName, callback) {
    var args = {};
    var argsString = "";

    args.filePath = filePath;
    args.fileName = fileName;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, script, callback);
}

function callRScript(argsString, script, callback) {
    exec("Rscript " + script + " --args \"" + argsString + "\"", function(error, stdout, stderr) {
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }
        //console.log(stdout);

        var parsedValue = JSON.parse(stdout);
        var status = parsedValue.status;
        var message = parsedValue.message;

        if (status > 0) {
            callback({ status: status, message: message });
        } else {
            callback({});
        }
    });
}

module.exports = {
    handler: handler
};
