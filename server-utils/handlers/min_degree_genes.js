var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/matrix_file_utils');
var geneUtils = require(APP_BASE_DIRECTORY + '/server-utils/gene_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var args = {};
    var argsString = "";
    var file;
    var user = authenticationUtils.getUserFromToken(req.body.token);

    file = matrixFileUtils.getRequestedFile(req.body.selectedFile, user);

    if (file == null || file.path == null || file.name == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.fileName = matrixFileUtils.getCorrespondingDegreesFileName(file);
    args.path = file.path;
    args.minFilterAmount = req.body.filterAmount.min;
    args.topFilterAmount = req.body.filterAmount.top;
    args.filterType = req.body.filterType;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res);
}

function callRScript(argsString, res) {
    exec("Rscript r_scripts/get_min_degree_genes.R --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            if (stderr != null && stderr != "") {
                console.log('stderr: ' + stderr);
            }

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var message = parsedValue.message;

            if (message) {
                res.json({ error: message });
                return;
            }

            var rowNodes = [];
            var colNodes = [];

            var rowDegrees = parsedValue.rowDegrees;
            var colDegrees = parsedValue.colDegrees;

            var rowNames = parsedValue.rowNames;
            var colNames = parsedValue.colNames;

            rowNodes = geneUtils.createGeneList(rowNames, rowDegrees);
            colNodes = geneUtils.createGeneList(colNames, colDegrees);

            res.send({ topGenes: { row: rowNodes, col: colNodes } });
        });
}

module.exports = {
    handler: handler
};