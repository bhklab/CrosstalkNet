var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/matrix_file_utils');
var geneUtils = require(APP_BASE_DIRECTORY + '/server-utils/gene_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var args = { fileName: null };
    var argsString = "";
    var file;
    var user = authenticationUtils.getUserFromToken(req.body.token);
    //console.log(req.body);

    file = matrixFileUtils.getRequestedFile(req.body.selectedFile, user);

    if (file == null || file.path == null || file.name == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    var geneList = [];

    args.fileName = matrixFileUtils.getCorrespondingDegreesFileName(file);
    args.path = file.path;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res);
}

function callRScript(argsString, res) {
    exec("Rscript r_scripts/get_gene_list.R --args \"" + argsString + "\"", {
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

            var allGenes = [];
            var rowPost = parsedValue.rowPost;
            var colPost = parsedValue.colPost;

            var rowDegrees = parsedValue.rowDegrees;
            var colDegrees = parsedValue.colDegrees;

            var rowNames = parsedValue.rowNames;
            var colNames = parsedValue.colNames;

            var maxDegree = parsedValue.maxDegree;

            allGenes = allGenes.concat(geneUtils.createGeneList(rowNames, rowDegrees));
            allGenes = allGenes.concat(geneUtils.createGeneList(colNames, colDegrees));

            res.send({ geneList: allGenes, maxDegree: maxDegree, rowPost: rowPost, colPost: colPost });
        });
}

module.exports = {
    handler: handler
};