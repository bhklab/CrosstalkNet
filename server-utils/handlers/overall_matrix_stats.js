var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + 'server-utils/matrix_file_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var args = {};
    var file;
    var user = authenticationUtils.getUserFromToken(req.body.token);

    file = matrixFileUtils.getRequestedFile(req.body.selectedFile, user);

    if (file == null || file.path == null || file.name == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.filePath = file.path + file.name;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res);
}

function callRScript(argsString, res) {
    exec("Rscript r_scripts/get_overall_matrix_stats.R  --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var overallMatrixStats = {};
            var parsedValue = JSON.parse(stdout);

            overallMatrixStats.selfLoops = parsedValue.selfLoops;
            overallMatrixStats.significantInteractions = parsedValue.significantInteractions;
            res.send({ overallMatrixStats: overallMatrixStats });
        });
}

module.exports = {
    handler: handler
};