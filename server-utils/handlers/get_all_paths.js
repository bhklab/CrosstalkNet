var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + 'server-utils/matrix_file_utils');
var parseUtils = require(APP_BASE_DIRECTORY + 'server-utils/parse_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var args = {};
    var argsString = "";
    var source = req.body.source;
    var target = req.body.target;
    var files = null;
    var user = authenticationUtils.getUserFromToken(req.body.token);

    files = matrixFileUtils.getRequestedFiles(req.body.selectedFile, req.body.selectedNetworkType, user);

    if (files == null) {
        res.send({ error: "Please specify the necessary files." });
        return;
    } else if (files.error != null) {
        res.send({ error: files.error });
        return;
    }

    args.selectedNetworkType = req.body.selectedNetworkType;
    args.fileNameMatrixNormal = files.normal;
    args.fileNameMatrixTumor = files.tumor;
    args.fileNameMatrixDelta = files.delta;

    args.source = source;
    args.target = target;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res, req.body.selectedNetworkType);
}

function callRScript(argsString, res, selectedNetworkType) {
    exec("Rscript r_scripts/get_all_paths.R --args \"" + argsString + "\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        if (error != null) {
            console.log('error: ' + error);
        }

        if (stderr != null && stderr != "") {
            console.log(stderr);
        }

        var parsedValue = JSON.parse(stdout);
        var message = parsedValue.message;

        if (message) {
            res.json({ error: message });
            return;
        }

        var paths = parsedValue.paths;
        paths = parseUtils.removeDotsFromPropertyNames(paths);
        var types = ["weight"];

        if (selectedNetworkType == 'delta') {
            types.push('normal');
            types.push('tumor');
        }

        res.send({ paths: paths, types: types });
    });
}

module.exports = {
    handler: handler
};
