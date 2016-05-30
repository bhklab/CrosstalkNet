const fs = require('fs');

var exec = require('child_process').exec;
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
var multiparty = require('connect-multiparty');
var multipartyMiddleware = multiparty();

var geneListCache = { "001": null, "01": null, "05": null, "1": null };
var initialConfig = null;
var initialElements = { "001": null, "01": null, "05": null, "1": null };
var selfLoopGeneNames = { "001": null, "01": null, "05": null, "1": null };

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/gene-list', function(req, res) {
    var pValue = req.query.pValue;
    console.log(pValue);

    if (geneListCache[pValue] != null) {
        res.json({ geneList: geneListCache[pValue] });
    } else {
        res.json({ error: "Could not get gene list for P Value:" + pValue });
    }
});

app.post('/neighbour-general', function(req, res) {
    var argsString = "";
    var selectedGeneNames = [];
    var argsArray = [];
    var selectedGenes = req.body.selectedGenes;
    var pValue = req.body.pValue;
    var requestedLayout = req.body.layout;
    var numberOfGenes = 0;
    var genesArg = "";
    console.log("selectedGenes:");
    console.log(selectedGenes);
    console.log("pValue: ")
    console.log(pValue);

    if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Error" });
        return;
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    var initialColor = selectedGenes[0].value.endsWith("-E") ? "red" : "blue";
    numberOfGenes = selectedGenes.length;

    argsArray = [pValue, numberOfGenes];
    argsArray = argsArray.concat(selectedGeneNames);
    argsString = execUtils.createArgsStringFromArray(argsArray);


    var child = exec("Rscript R_scripts/findCorrelationsReturnEdges.R --args " + argsString, { maxBuffer: 1024 * 50000 },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var weights = parsedValue.value[0].value;
            var degrees = parsedValue.value[1].value;
            var parsedEdges = parsedValue.value[2].value;

            var sourceNodes = [];
            var nodes = {};
            var parentNodes = [];
            var edges = [];
            var elements = [];
            var config = null;
            var layout = null;

            for (var i = 0; i < selectedGenes.length; i++) {
                sourceNodes.push(nodeUtils.createNodes([selectedGenes[i].value], 'par' + i, 0, selectedGenes[i].object.degree));
            }

            if (degrees[0].attributes.names == null) {
                sourceNodes[0] = nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                    100, 0, 0);
                sourceNodes[0] = nodeUtils.addStyleToNodes(sourceNodes[0], 10, 10,
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

            for (var i = 0; i < weights.length; i++) {
                nodes["" + i] = nodeUtils.createNodes(weights[i].value, "par" + (i + 1), 0, degrees[i].value);
            }

            for (var i = 0; i < selectedGenes.length + 1; i++) {
                if (i < 1) {
                    parentNodes.push({
                        data: {
                            id: "par" + i
                        }
                    });
                } else if (nodes["" + (i - 1)].length > 0) {
                    parentNodes.push({
                        data: {
                            id: "par" + i
                        }
                    });
                }
            }

            for (var i = 0; i < parsedEdges.length; i++) {
                console.log(parsedEdges[i].value);
                edges = edges.concat(edgeUtils.createEdgesFromREdges(parsedEdges[i].value, i + 1));
            }

            sourceNodes[0] = nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                100, 0, 0);
            sourceNodes[0] = nodeUtils.addStyleToNodes(sourceNodes[0], 10, 10,
                "left",
                "center",
                initialColor);

            elements = elements.concat(parentNodes);
            elements = elements.concat(edges);
            elements.push(sourceNodes[0][0]);

            i = 1;
            for (nodeCollection in nodes) {
                initialColor = initialColor == "red" ? "blue" : "red";
                nodes[nodeCollection] = nodeUtils.addPositionsToNodes(nodes[nodeCollection], 400 * i, 100, 0, 20);
                nodes[nodeCollection] = nodeUtils.addStyleToNodes(nodes[nodeCollection], 10, 10, "center", "top", initialColor);
                elements = elements.concat(nodes[nodeCollection]);
                i++;
            }

            config = configUtils.createConfig();
            layout = configUtils.createPresetLayout();

            configUtils.setConfigElements(config, elements);
            configUtils.setConfigLayout(config, layout);

            res.json({ config: config });
        });
});

app.post('/submatrix', function(req, res) {
    var argsString = "";
    var argsArray = [];
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var pValue = req.body.pValue;
    var requestedLayout = req.body.layout;
    var minPositiveWeightFirst = req.body.minPositiveWeightFirst;
    var minNegativeWeightFirst = req.body.minNegativeWeightFirst;
    var minPositiveWeightSecond = req.body.minPositiveWeightSecond;
    var minNegativeWeightSecond = req.body.minNegativeWeightSecond;
    var filterFirst = req.body.filterFirst;
    var filterSecond = req.body.filterSecond;
    var depth = req.body.depth;

    if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Error" });
        return;
    }
    console.log(req.body);

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    argsArray = [pValue, minNegativeWeightFirst, minPositiveWeightFirst, minNegativeWeightSecond, minPositiveWeightSecond, filterFirst, filterSecond, selectedGenes.length, depth];
    argsArray = argsArray.concat(selectedGeneNames);
    argsString = execUtils.createArgsStringFromArray(argsArray);

    var child = exec("Rscript R_Scripts/getRelevantSubmatrixReturnEdges.R --args " + argsString, {
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
            var weights = parsedValue.value[0].value;
            var degrees = parsedValue.value[1].value;
            var parsedEdges = parsedValue.value[2].value;

            var weightsFirst = weights[0].value;
            var weightsSecond = weights[1].value;

            var degreesFirst = degrees[0].value;
            var degreesSecond = degrees[1].value;

            var parsedEdgesFirst = parsedEdges[0].value;
            var parsedEdgesSecond = parsedEdges[1].value;
            var minNegativeWeight = parsedValue.value[3].value[0];
            var maxPositiveWeight = parsedValue.value[6].value[0];

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

            if (false) { //degreesFirst[0].attributes.names == null) {
                sourceNodes[0] = nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                    100, 0, 0);
                sourceNodes[0] = nodeUtils.addStyleToNodes(sourceNodes[0], 10, 10,
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

            for (var i = 0; i < weightsFirst.length; i++) {
                firstNodes[i] = nodeUtils.createNodes(weightsFirst[i].value, null, 0, degreesFirst[i].value, 1);
                allNodes = allNodes.concat(firstNodes[i]);
            }

            for (var i = 0; i < weightsSecond.length; i++) {
                secondNodes[i] = nodeUtils.createNodes(weightsSecond[i].value, null, 0, degreesSecond[i].value, 2);
                allNodes = allNodes.concat(secondNodes[i]);
            }

            for (var i = 0; i < parsedEdgesFirst.length; i++) {
                var cytoscapeEdges = edgeUtils.createEdgesFromREdges(parsedEdgesFirst[i].value, 1);
                firstNeighbourInteractions = firstNeighbourInteractions.concat(cytoscapeEdges)
                edges = edges.concat(cytoscapeEdges);
            }

            for (var i = 0; i < parsedEdgesSecond.length; i++) {
                var cytoscapeEdges = edgeUtils.createEdgesFromREdges(parsedEdgesSecond[i].value, 2);
                secondNeighbourInteractions = secondNeighbourInteractions.concat(cytoscapeEdges)
                edges = edges.concat(cytoscapeEdges);
            }

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
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSource);
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
                firstNeighbourInteractions: firstNeighbourInteractions,
                secondNeighbourInteractions: secondNeighbourInteractions,
                firstNeighbours: firstNodes,
                secondNeighbours: secondNodes,
                edgeDictionary: edgeDictionary,
                selfLoops: selfLoops
            });
        });
});

app.post('/uploadMatrix', multipartyMiddleware, function(req, res) {
    var file = req.files.file;
    var data = req.body.data;
    console.log(file.name);
    console.log(file.type);
    //console.log('file: %j', file);
    console.log(req.body);

    data = data.replace(/^data:;base64,/, "");

    fs.writeFile('test.Rdata', data, 'base64',(err) => {
        if (err) throw err;
        console.log('It\'s saved!');
    });
});

function cacheGeneListForPValue(pValue, script) {
    var child = exec("Rscript " + script + " --args \"" + pValue + "\"", {
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

            var epiDegrees = parsedValue.value[0].value[0].value;
            var stromaDegrees = parsedValue.value[0].value[1].value;

            var epiGeneNames = parsedValue.value[0].value[0].attributes.names.value;
            var stromaGeneNames = parsedValue.value[0].value[1].attributes.names.value;

            allGenes = allGenes.concat(geneUtils.createGeneList(epiGeneNames, epiDegrees));
            allGenes = allGenes.concat(geneUtils.createGeneList(stromaGeneNames, stromaDegrees));

            geneListCache[pValue] = allGenes;
        });
}

function createOverallElements() {
    var pValues = ["001", "01", "05", "1"];
    console.log("Creating overall elements");

    for (var i = 0; i < pValues.length; i++) {
        cacheGeneListForPValue(pValues[i], "R_Scripts/getGeneList.R");
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

app.listen(5000, function() {
    console.log("Listening on port 5000");
    console.log("Initializing data and config")
    initializeServer();
});
