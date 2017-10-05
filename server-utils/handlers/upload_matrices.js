var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + 'server-utils/matrix_file_utils');
var exec = require('child_process').exec;
var async = require('async');

function handler(req, res) {
    var user = authenticationUtils.getUserFromToken(req.body.token);
    var files = req.body.files;
    var postFixes = req.body.postFixes;
    var uploadType = req.body.type;

    if (user == null) {
        console.log("Unable to find user for token: " + req.body.token);
        res.send({ error: "Unable to find user for specified token" });
        return;
    }

    if (uploadType == 'delta' && (files.delta == null || files.normal == null || files.tumor == null)) {
        res.send({ error: "Not enough files specified for delta network" });
        return;
    } else if (uploadType != 'delta' && uploadType != 'tumor' && uploadType != 'normal') {
        res.send({ error: "Incorrect upload type specified" });
        return;
    }

    var nonEmptyFiles = [];

    for (var prop in files) {
        if (files[prop] != null) {
            if (files[prop].name && typeof files[prop].name == 'string') {
                if (!files[prop].name.toLowerCase().endsWith('.rdata')) {
                    res.send({ error: "File upload failed. Please specify an Rdata file instead of: " + files[prop].name });
                    return;
                } else if (files[prop].name.startsWith("degree")) {
                    res.send({ error: "File upload failed. Please change the file name so that it doesn't contain 'degree' in it. File name: " + files[prop].name });
                    return;
                } else if (files[prop].data == null) {
                    res.send({ error: "File upload failed. File name: " + files[prop].name });
                    return;
                }
            } else if (!files[prop].name) {
                res.send({ error: "File upload failed. Could not determine name of uploaded file(s)" })
                return;
            }

            if (uploadType == 'delta') {
                files[prop].name = "dLtA" + files[prop].name;
            }

            nonEmptyFiles.push(prop);
        }
    }

    writeFiles(nonEmptyFiles, files, user);
    checkFiles(nonEmptyFiles, files, user, postFixes, res);
}

function writeFiles(nonEmptyFiles, files, user) {
    async.eachSeries(nonEmptyFiles, function iterate(type, callback) {
        console.log(files[type].name);
        files[type].data = files[type].data.replace(/^data:;base64,/, "");
        matrixFileUtils.createDirectory(matrixFileUtils.BASE_UPLOAD_DIRECTORY, user.name, type, callback);
        matrixFileUtils.writeFile(matrixFileUtils.BASE_UPLOAD_DIRECTORY, files[type], user.name, type, callback);

    }, function done() {
        console.log("Finished writing files");
    });
}

function checkFiles(nonEmptyFiles, files, user, postFixes, res) {
    async.eachSeries(nonEmptyFiles, function iterate(type, callback) {
        console.log("type:" + type);
        verifyFile("r_scripts/matrix_file_checker.R", matrixFileUtils.BASE_UPLOAD_DIRECTORY + user.name + "/" + type + "/", files[type].name, postFixes, callback);
    }, function done(result) {
        if (result != null) {
            for (var i = 0; i < nonEmptyFiles.length; i++) {
                matrixFileUtils.removeFile(matrixFileUtils.BASE_UPLOAD_DIRECTORY + user.name + "/" + nonEmptyFiles[i] + "/", files[nonEmptyFiles[i]], null);
            }

            matrixFileUtils.updateAvailableMatrixCache();
            res.send({ fileStatus: "Failed to upload file(s). " + result.message, errorStatus: result.status })
        } else {
            matrixFileUtils.updateAvailableMatrixCache();
            res.send({ fileStatus: "Successfully uploaded file(s). Please check the dropdown to select new file(s). " })
        }

        console.log("Finished verifying files");
    });
}

function verifyFile(script, filePath, fileName, postFixes, callback) {
    var args = {};
    var argsString = "";

    args.filePath = filePath;
    args.fileName = fileName;
    args.colPost = postFixes.colPost;
    args.rowPost = postFixes.rowPost;

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
            callback();
        }
    });
}

module.exports = {
    handler: handler
};
