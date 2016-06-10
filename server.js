const fs = require('fs');
//var opencpu = require('opencpu');
var exec = require('child_process').exec;
var child_process = require('child_process');
var async = require('async');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
var nodeUtils = require('nodeUtils');
var configUtils = require('configUtils');
var copyUtils = require('copyUtils');
var edgeUtils = require('edgeUtils');
var styleUtils = require('styleUtils');
var geneUtils = require('geneUtils');
var execUtils = require('execUtils');
var layoutUtils = require('layoutUtils');
var clientTableUtils = require('clientTableUtils');
var parseUtils = require('parseUtils');
var multiparty = require('connect-multiparty');

var geneListCache = { "001": null, "01": null, "05": null, "1": null };
var initialConfig = null;
var initialElements = { "001": null, "01": null, "05": null, "1": null };
var selfLoopGeneNames = { "001": null, "01": null, "05": null, "1": null };

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.post('/gene-list', function(req, res) {
    var args = { pValue: null, fileName: null };
    var argsString = "";
    var file = req.body.file;
    args.pValue = file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;
    var geneList = [];

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/getGeneList.R --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var allGenes = [];

            var epiDegrees = parsedValue.epiDegrees;
            var stromaDegrees = parsedValue.stromaDegrees;

            var epiGeneNames = parsedValue.epiDegreesNames;
            var stromaGeneNames = parsedValue.stromaDegreesNames;

            allGenes = allGenes.concat(geneUtils.createGeneList(epiGeneNames, epiDegrees));
            allGenes = allGenes.concat(geneUtils.createGeneList(stromaGeneNames, stromaDegrees));

            geneList = allGenes.map(function(gene) {
                return {
                    value: gene.name,
                    display: gene.name + ' ' + gene.degree,
                    object: gene
                };
            });

            geneListCache[file.fileName] = geneList;

            res.send({ geneList: geneList });
        });
});

app.post('/neighbour-general', function(req, res) {
    var args = {};
    var file = req.body.file;
    var argsString = "";
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var requestedLayout = req.body.layout;
    var genesArg = "";

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.pValue = file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;

    if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Please select a gene." });
        return;
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    args.selectedGenes = selectedGeneNames;

    var initialColor = selectedGenes[0].value.endsWith("-E") ? "red" : "blue";

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_scripts/neighbourExplorer.R --args \"" + argsString + "\"", { maxBuffer: 1024 * 50000 },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var parsedNodes = parsedValue.nodes
            var parsedEdges = parsedValue.edges;

            var sourceNodes = [];
            var nodes = [];
            var parentNodes = [];
            var edges = [];
            var elements = [];
            var config = null;
            var layout = null;

            sourceNodes.push(nodeUtils.createNodes([selectedGenes[0].value], 'par' + 0, 0, selectedGenes[0].object.degree));

            if (parsedNodes.length == null) {
                nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                    100, 0, 0);
                nodeUtils.addStyleToNodes(sourceNodes[0], 10, 10,
                    "left",
                    "center",
                    "blue");
                elements.push(sourceNodes[0][0]);

                config = configUtils.createConfig();
                layout = configUtils.createPresetLayout();

                configUtils.setConfigElements(config, elements);
                configUtils.setConfigLayout(config, layout);

                res.json({ config: config });
                return;
            }

            edges = edgeUtils.createEdgesFromREdgesFinal(parsedEdges, 0);

            for (var i = 0; i < parsedNodes.length; i++) {
                nodes.push(nodeUtils.createNodesFromRNodes(parsedNodes[i], true));
            }

            console.log(nodes);


            if (requestedLayout == 'bipartite' || requestedLayout == 'preset') {
                nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                    100, 0, 0);
                nodeUtils.addStyleToNodes(sourceNodes[0], 10, 10,
                    "left",
                    "center",
                    initialColor);

                for (var i = 0; i < selectedGenes.length + 1; i++) {
                    if (i < 1) {
                        parentNodes.push({
                            data: {
                                id: "par" + i
                            }
                        });
                    } else if (nodes[i - 1].length > 0) { //if (nodes["" + (i - 1)].length > 0) {
                        parentNodes.push({
                            data: {
                                id: "par" + i
                            }
                        });
                    }
                }

                var yIncrement = 0;

                for (var j = 0; j < nodes.length; j++) {
                    nodeUtils.addPositionsToNodes(nodes[j], 400 * (j + 1), 100, 0, 20);
                }

                elements = elements.concat(parentNodes);

                layout = layoutUtils.createPresetLayout();
                config = configUtils.createConfig();

                for (prop in styleUtils.bipartiteStyles.epi) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi[prop]);
                }

                for (prop in styleUtils.bipartiteStyles.stroma) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma[prop]);
                }

                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
            } else {
                for (var i = 0; i < nodes.length; i++) {
                    for (var j = 0; j < nodes[i].length; j++) {
                        if (nodes[i][j].data.isSource) {
                            nodeUtils.addClassToNodes(nodes[i][j], "sourceNode");
                        }
                    }
                }

                config = configUtils.createConfig();
                layout = layoutUtils.createRandomLayout(nodes.length, 12);

                nodeUtils.addClassToNodes(sourceNodes[0], "sourceNode");
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceEpi);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceStroma);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.labelBackground);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.nodeColor);
            }

            elements = elements.concat([].concat.apply([], nodes));
            elements = elements.concat(edges);
            elements.push(sourceNodes[0][0]);

            configUtils.setConfigElements(config, elements);
            configUtils.setConfigLayout(config, layout);

            res.json({ config: config });
        });
});

app.post('/submatrix', function(req, res) {
    var args = {};
    var argsString = "";
    var argsArray = [];
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var file = req.body.file;
    var requestedLayout = req.body.layout;

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.pValue = req.body.file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;
    args.minPositiveWeightFirst = req.body.minPositiveWeightFirst;
    args.minNegativeWeightFirst = req.body.minNegativeWeightFirst;
    args.minPositiveWeightSecond = req.body.minPositiveWeightSecond;
    args.minNegativeWeightSecond = req.body.minNegativeWeightSecond;
    args.weightFilterFirst = req.body.filterFirst;
    args.weightFilterSecond = req.body.filterSecond;
    args.depth = req.body.depth;

    if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Please select at least 1 gene of interest." });
        return;
    }

    console.log(req.body);

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    args.genesOfInterest = selectedGeneNames;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/submatrix.R --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            console.log(parsedValue);

            var parsedNodesFirst = parsedValue.neighboursNodes.first;
            var parsedNodesSecond = parsedValue.neighboursNodes.second;

            var parsedEdgesFirst = parsedValue.edges.first;
            var parsedEdgesSecond = parsedValue.edges.second;

            var minNegativeWeight = parsedValue.minNegativeWeight;
            var maxPositiveWeight = parsedValue.maxPositiveWeight;

            var sourceNodes = [];
            var firstNodes = [];
            var secondNodes = [];
            var parentNodes = [];
            var allNodes = [];
            var edges = [];
            var firstNeighbourInteractions = [];
            var secondNeighbourInteractions = [];
            var edgeDictionary = {};
            var selfLoops = [];
            var elements = [];
            var config = null;
            var layout = null;

            for (var i = 0; i < selectedGenes.length; i++) {
                sourceNodes.push(nodeUtils.createNodes([selectedGenes[i].object.name], null, 0, selectedGenes[i].object.degree, -1)[0]);
                allNodes.push(sourceNodes[i]);
            }

            for (var i = 0; i < parsedNodesFirst.length; i++) {
                firstNodes[i] = nodeUtils.createNodesFromRNodes(parsedNodesFirst[i], false);
                allNodes = allNodes.concat(firstNodes[i]);
            }

            for (var i = 0; i < parsedNodesSecond.length; i++) {
                secondNodes[i] = nodeUtils.createNodesFromRNodes(parsedNodesSecond[i], false);
                allNodes = allNodes.concat(secondNodes[i]);
            }

            var cytoscapeEdges = edgeUtils.createEdgesFromREdgesFinal(parsedEdgesFirst, 1);
            firstNeighbourInteractions = firstNeighbourInteractions.concat(cytoscapeEdges)
            cytoscapeEdges = edgeUtils.createEdgesFromREdgesFinal(parsedEdgesSecond, 2);
            secondNeighbourInteractions = secondNeighbourInteractions.concat(cytoscapeEdges)
            edges = edges.concat(firstNeighbourInteractions);
            edges = edges.concat(secondNeighbourInteractions);

            elements = elements.concat(edges);
            config = configUtils.createConfig();

            if (requestedLayout == 'bipartite' || requestedLayout == 'preset') {
                allNodes.push({
                    data: { id: "epi" }
                });
                allNodes.push({
                    data: { id: "stroma" }
                });
                layoutUtils.positionNodesBipartite(allNodes, 100, 300, 100, 100);
                layout = layoutUtils.createPresetLayout();

                for (prop in styleUtils.bipartiteStyles.epi) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi[prop]);
                }

                for (prop in styleUtils.bipartiteStyles.stroma) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma[prop]);
                }

                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium)
            } else if (requestedLayout == 'clustered') {
                var largestClusterSize = 0;
                nodeUtils.addClassToNodes(sourceNodes, "sourceNode");

                for (var i = 0; i < sourceNodes.length; i++) {
                    var clusterSize = layoutUtils.getMinRadius(firstNodes[i] == null ? 0 : firstNodes[i].length, 6) + layoutUtils.getMinRadius(secondNodes[i] == null ? 0 : secondNodes[i].length, 6)

                    if (clusterSize > largestClusterSize) {
                        largestClusterSize = clusterSize;
                    }
                }

                for (var i = 0; i < sourceNodes.length; i++) {
                    layoutUtils.positionNodesClustered(sourceNodes[i], firstNodes[i] == null ? [] : firstNodes[i], secondNodes[i] == null ? [] : secondNodes[i], i, sourceNodes.length, 6, largestClusterSize);
                    //layoutUtils.positionNodesSpiral(sourceNodes[i], firstNodes[i] == null ? [] : firstNodes[i], secondNodes[i] == null ? [] : secondNodes[i], i, sourceNodes.length);
                }

                layout = layoutUtils.createPresetLayout();
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.source);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.nodeColor);
            } else {
                layout = layoutUtils.createRandomLayout(allNodes.length, 12);
                nodeUtils.addClassToNodes(sourceNodes, "sourceNode");
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceEpi);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceStroma);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.labelBackground);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.nodeColor);
            }

            configUtils.setConfigElements(config, edges.concat(allNodes));
            configUtils.setConfigLayout(config, layout);
            edgeDictionary = clientTableUtils.createEdgeDictionary(edges);
            selfLoops = clientTableUtils.getSelfLoops(edges);

            res.json({
                config: config,
                minNegativeWeight: minNegativeWeight,
                maxPositiveWeight: maxPositiveWeight,
                firstNeighbours: firstNodes,
                secondNeighbours: secondNodes,
                edgeDictionary: edgeDictionary,
                selfLoops: selfLoops
            });
        });
});

app.post('/get-all-paths', function(req, res) {
    var args = {};
    var argsString = "";
    var argsArray = [];
    var file = req.body.file;
    var source = req.body.source;
    var target = req.body.target;

    console.log(file);
    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.source = source;
    args.target = target;
    args.fileName = file.fileName;
    args.path = file.path;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/getAllPaths.R --args \"" + argsString + "\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        if (error != null) {
            console.log('error: ' + error);
        }

        if (stderr != null) {
            console.log(stderr);
        }

        var parsedValue = JSON.parse(stdout);
        var paths = parsedValue.paths;

        res.send({ paths: paths });
    });

});

app.post('/upload-matrix', multiparty({maxFieldsSize: 15 *1024 *1024}), function(req, res) {
    var file = req.files.file;
    var data = req.body.data;
    console.log(file.name);
    console.log(file.type);
    //console.log('file: %j', file);

    data = data.replace(/^data:;base64,/, "");

    fs.writeFile('R_Scripts/User_Matrices/' + file.name, data, 'base64', (err) => {
        if (err) throw err;
        checkFileIntegrity(req, res, file);
    });
});

app.get('/available-matrices', function(req, res) {
    var result = getAvailableMatrices();

    res.send({ fileList: result });
});

app.post('/overall-matrix-stats', function(req, res) {
    var args = {};
    var file = req.body.file;
    args.fileName = file.fileName;
    args.path = file.path;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/getOverallMatrixStats.R  --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var overallMatrixStats = {};
            var parsedValue = JSON.parse(stdout);

            overallMatrixStats.selfLoops = parsedValue.selfLoops;
            overallMatrixStats.significantInteractions = parsedValue.significantInteractions;
            //overallMatrixStats.significantInteractions = parsedValue.value[0].value[1].value;

            //console.log("parsedValue: ");
            //console.log("%j", parsedValue);
            res.send({ overallMatrixStats: overallMatrixStats });
        });
});

function getAvailableMatrices() {
    var fileNames = [];
    var fileList = [];
    var result = [];

    fileNames = fs.readdirSync('R_Scripts/Full_Matrices');
    fileList = fileNames.map(function(file) {
        return {
            fileName: file,
            pValue: file.split(".").length > 2 ? file.split(".")[1] : "",
            path: "Full_Matrices/"
        };
    });

    fileNames = fs.readdirSync('R_Scripts/User_Matrices');

    fileList = fileList.concat(fileNames.map(function(file) {
        return {
            fileName: file,
            pValue: "", //file.split(".").length > 2 ? file.split(".")[1] : "",
            path: "User_Matrices/"
        };
    }));

    for (var i = 0; i < fileList.length; i++) {
        if (fileList[i].fileName.indexOf('degree') < 0) {
            result.push(fileList[i]);
        }
    }

    return result;
}

function checkFileIntegrity(req, res, file) {
    var child = exec("Rscript R_Scripts/fileChecker.R --args " + file.name, function(error, stdout, stderr) {
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }
        console.log(stdout);

        var parsedValue = JSON.parse(stdout);
        var status = parsedValue.status;
        var message = parsedValue.message;
        var fileList = getAvailableMatrices();

        res.send({ fileStatus: message, fileList: fileList });
    });
}

function createOverallElements() {
    var pValues = ["001", "01", "05", "1"];
    console.log("Creating overall elements");

    for (var i = 0; i < pValues.length; i++) {
        //cacheGeneListForPValue(pValues[i], "R_Scripts/getGeneList.R");
    }
}

function initializeServer() {
    createAndStoreCorrelationsAndDegrees(createOverallElements);
}

function createAndStoreCorrelationsAndDegrees(callback) {
    var child = exec("Rscript R_Scripts/createAndStoreCorrelationsAndDegrees.R", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }

        console.log("Done creating and storing degrees");

        callback();
    });
}

function testOpenCPU() {
    opencpu.rCall("/library/testpackage/R/getOverallMatrixStats", {
        fileName: "fullcorMatrix.1.Rdata",
        path: "C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts/"
    }, function(err, data) {
        if (!err) {
            console.log(data.length); // => 42
        } else {
            console.log("opencpu call failed.");
        }

        console.log(err)
    });
}

function testInteractiveShell() {
    // var ps = child_process.spawn('R');

    // ps.stdout.on("data", function(data) {
    //     console.log(data);
    // });

    // console.log(ps);

    // ps.stdout.pipe(process.stdout);
    // ps.stdin.write('1+1');
    // ps.stdin.end();

    const ls = child_process.spawn('R', ['--no-save']);

    /*
    ls.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
        ls.stdin.write('1+1');
        ls.stdin.end();
    });

    ls.stderr.on('data', (data) => {
        console.log(`stderr: ${data}`);
    });

    ls.on('close', (code) => {
        console.log(`child process exited with code ${code}`);
    });*/


    ls.stdout.pipe(process.stdout);
    ls.stdin.write('1+1\n');
    ls.stdin.write('2+2\n');
    ls.stdin.write('3+3\n');


}

app.all('*', function(req, res) {
    res.redirect({ error: "Please send a valid query." });
});

app.listen(5000, function() {
    console.log("Listening on port 5000");
    console.log("Initializing data and config");
    //testOpenCPU();
    initializeServer();
    //testInteractiveShell();
});
