var exec = require('child_process').exec;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
var nodeUtils = require('nodeUtils');
var configUtils = require('configUtils');
var copyUtils = require('copyUtils');

var initialConfig = null;
var initialElements = { "001": null, "01": null, "05": null, "1": null };
var selfLoopGeneNames = { "001": null, "01": null, "05": null, "1": null };

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/overall-graph', function(req, res) {
    // The client side will also be specifying what kind of layout they want. For now, we'll stick to 
    // the preset layout
    var pValue = req.query.pValue;
    var requestedLayout = 'concentric'; //req.query.layout;
    var config = null;
    var configLayout = null;

    //console.log(pValue);
    //console.log(initialElements);

    if (initialElements[pValue] != null) {
        var elements = copyUtils.createElementsCopy(initialElements[pValue].elements);
        config = configUtils.createConfig(elements);

        if (requestedLayout == 'preset') {
            elements.epiNodes = nodeUtils.addPositionsToNodes(elements.epiNodes, 100, 100,
                0, 20);
            elements.epiNodes = nodeUtils.addStyleToNodes(elements.epiNodes, 10, 10, "left",
                "center", "blue");

            elements.stromaNodes = nodeUtils.addPositionsToNodes(elements.stromaNodes, 300,
                100, 0,
                20);
            elements.stromaNodes = nodeUtils.addStyleToNodes(elements.stromaNodes, 10, 10,
                "right",
                "center",
                "red");

            configUtils.setConfigElements(config, elements);
            configLayout = configUtils.createPresetLayout();
            configUtils.setConfigLayout(config, configLayout);


        } else if (requestedLayout == 'concentric') {
            console.log(elements.epiNodes[0]);
            elements.epiParent = null;
            elements.stromaParent = null;
            console.log(elements.epiNodes[0]);
            configUtils.setConfigElements(config, elements);
            console.log(config.elements[0]);
            configLayout = configUtils.createRandomLayout();
            configUtils.setConfigLayout(config, configLayout);
            console.log(config.elements[0]);
            var epiColor = {
                'selector': 'node[id$="-e"], node[id$="-er"]',
                'style': {
                    'background-color': 'red'
                }
            };

            var stromaColor = {
                'selector': 'node[id$="-s"], node[id$="-sr"]',
                'style': {
                    'background-color': 'blue'
                }
            };

            configUtils.addStyleToConfig(config, epiColor);
            configUtils.addStyleToConfig(config, stromaColor);

            console.log(config.elements[0]);
        }

        console.log(config.elements[0]);
        res.json({
            config: config,
            totalInteractions: initialElements[pValue].totalInteractions,
            epiToStromaInteractions: initialElements[pValue].epiToStromaInteractions,
            stromaToEpiInteractions: initialElements[pValue].stromaToEpiInteractions
        });
        return;
    }
});

app.get('/self-loops', function(req, res) {
    var pValue = req.query.pValue;
    console.log(pValue);
    if (selfLoopGeneNames[pValue] != null) {
        //console.log(initialElements[pValue].elements[9]);
        res.json({
            geneNames: selfLoopGeneNames[pValue].geneNames,
            numberOfLoops: selfLoopGeneNames[pValue].numberOfLoops
        });
        return;
    }
});

app.post('/neighbour-general', function(req, res) {
    var neighbour = req.body.neighbour;
    var gene = req.body.gene;
    var side = req.body.side;
    var degree = req.body.degree;
    var originalElements = req.body.originalElements;
    var pValue = req.body.pValue;

    var neighbourSide = side == "-e" ? "-s" : "-e"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene.toUpperCase() +
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + neighbour + "\"" + " " + "\"" +
        pValue + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            var elements = [];
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            console.log(parsedValue);

            var weights = parsedValue.value[0];
            var degrees = parsedValue.value[1].value;
            var hasSelfLoop = parsedValue.value[2].value;
            var neighbourGeneNames = weights.attributes.names.value;
            var dimension = neighbourGeneNames.length;
            var neighbourGeneWeights = weights.value;
            var neighboursGenes = [];
            var resultWeights = [];
            var parent = "";

            if (neighbour == 1) {
                parent = side == "-e" ? "stroma" : "epi";
            } else {
                parent = side == "-e" ? "stromaRight" : "epiRight";
            }

            var neighbourBgColor = side == "-e" ? "red" : "blue";
            var neighbourNodes = nodeUtils.createNodes(neighbourGeneNames, parent,
                neighbour == 1 ?
                4 : 8, degrees);
            neighbourNodes = nodeUtils.addPositionsToNodes(neighbourNodes, neighbour ==
                1 ? 400 : 800, 100, 0, 20);
            neighbourNodes = nodeUtils.addStyleToNodes(neighbourNodes, 10, 10, "left",
                "center", neighbourBgColor);

            var sourceNode = nodeUtils.createNodes([gene], side == "-e" ? "epi" :
                "stroma", 1, [
                    degree
                ]);
            var sourceBgColor = side == "-e" ? "blue" : "red";
            sourceNode = nodeUtils.addPositionsToNodes(sourceNode, 100, 100, 0, 0);
            sourceNode = nodeUtils.addStyleToNodes(sourceNode, 10, 10, "left", "center",
                sourceBgColor);

            var edges = createEdgesFromNode(sourceNode[0], neighbourNodes,
                neighbourGeneWeights,
                hasSelfLoop);

            if (neighbour == 1) {
                elements = elements.concat(sourceNode);
                elements.push({
                    data: {
                        id: 'epi'
                    }
                });
                elements.push({
                    data: {
                        id: 'stroma'
                    }
                });
            } else {
                elements = elements.concat(originalElements);
                if (neighbourNodes.length > 0) {
                    elements.push({
                        data: {
                            id: side == '-e' ? 'stromaRight' : 'epiRight'
                        }
                    });
                }

                var opposite = side == "-e" ? "-s" : "-e";

                console.log(hasSelfLoop);

                if (hasSelfLoop) {
                    elements.push({
                        data: {
                            id: 'selfLoop' + gene,
                            source: gene + side,
                            target: gene + opposite
                        }
                    });
                }
            }

            elements = elements.concat(neighbourNodes);
            elements = elements.concat(edges);

            var firstEdgeSelector = side == '-s' ? 'EpiToStroma' : 'StromaToEpi';
            firstEdgeSelector = firstEdgeSelector + gene;
            var config = configUtils.createConfig();

            configUtils.addStyleToConfig(config, {
                'selector': 'edge[id = "selfLoop' + gene + '"]',
                'style': {
                    'curve-style': 'bezier',
                    'line-style': 'solid',
                    'line-color': '#FF6D00',
                    'target-arrow-color': '#FF6D00',
                    'target-arrow-shape': 'triangle'
                }
            });
            configUtils.addStyleToConfig(config, {
                'selector': 'edge[id = "' + firstEdgeSelector + '"]',
                'style': {
                    'curve-style': 'bezier',
                    'line-style': 'solid',
                    'line-color': '#FF6D00',
                    'target-arrow-color': '#FF6D00',
                    'target-arrow-shape': 'triangle'
                }
            });
            configUtils.setConfigElements(config, elements);
            var presetLayout = configUtils.createPresetLayout();
            configUtils.setConfigLayout(config, presetLayout);

            res.json({ config: config });
        });
});


/*  For now, xPattern and yPattern will simply be increments to add at every step of the loop
 */


function createEdges(epiNodes, stromaNodes, weights) {
    var edges = [];

    for (var i = 0; i < epiNodes.length; i++) {
        for (var j = i + 1; j < stromaNodes.length; j++) {
            if (weights[i][j] > 0) {
                edges.push({
                    data: {
                        id: 'EpiToStroma' + epiNodes[i].data.id.slice(0, -2),
                        source: epiNodes[i].data.id,
                        target: stromaNodes[j].data.id
                    }
                });
            }

            if (weights[j][i] > 0) {
                edges.push({
                    data: {
                        id: 'StromaToEpi' + epiNodes[i].data.id.slice(0, -2),
                        source: stromaNodes[i].data.id,
                        target: epiNodes[j].data.id
                    }
                });
            }
        }

        if (weights[i][i] > 0) {
            edges.push({
                data: {
                    id: 'selfLoop' + epiNodes[i].data.id,
                    source: stromaNodes[i].data.id,
                    target: epiNodes[i].data.id
                }
            });
        }
    }

    return edges;
};

function createEdgesFromNode(node, neighbours, weights) {
    var edges = [];
    var idPrefix = node.data.parent == "epi" ? "EpiToStroma" : "StromaToEpi";
    for (var i = 0; i < neighbours.length; i++) {
        if (node.data.id)
            edges.push({
                data: {
                    id: idPrefix + neighbours[i].data.id.slice(0, -2),
                    source: node.data.id,
                    target: neighbours[i].data.id,
                    weight: weights[i]
                }
            })
    }

    return edges;
}

function createElements(epiDegrees, stromaDegrees, weights, geneNames) {
    var initialWeights = [];
    var dimension = geneNames.length;

    for (var i = 0; i < dimension; i++) {
        var temp = [];
        for (var j = 0; j < dimension; j++) {
            temp.push(weights.value[(dimension * i) + j]);
        }

        initialWeights.push(temp);
    }

    var elements = { epiNodes: null, stromaNodes: null, edges: null, epiParent: null, stromaParent: null };
    var epiNodes = nodeUtils.createNodes(geneNames, 'epi', 1, epiDegrees);
    var stromaNodes = nodeUtils.createNodes(geneNames, 'stroma', 2, stromaDegrees);
    var edges = createEdges(epiNodes, stromaNodes, initialWeights);

    elements.epiNodes = epiNodes;
    elements.stromaNodes = stromaNodes;
    elements.edges = edges;
    elements.epiParent = {
        data: {
            id: 'epi'
        }
    };
    elements.stromaParent = {
        data: {
            id: 'stroma'
        }
    };

    return elements;
}

function getWeightsAndDegreesFromROutput(stdout) {
    var parsedValue = JSON.parse(stdout);
    var epiDegrees = parsedValue.value[0].value[0].value;
    var stromaDegrees = parsedValue.value[0].value[1].value;
    var weights = parsedValue.value[1];
    var geneNames = weights.attributes.dimnames.value[0].value;
    var totalInteractions = parsedValue.value[2].value[0];
    var epiToStromaInteractions = parsedValue.value[3].value[0];
    var stromaToEpiInteractions = parsedValue.value[4].value[0];

    var result = {
        epiDegrees: epiDegrees,
        stromaDegrees: stromaDegrees,
        weights: weights,
        geneNames: geneNames,
        totalInteractions: totalInteractions,
        epiToStromaInteractions: epiToStromaInteractions,
        stromaToEpiInteractions: stromaToEpiInteractions
    }

    console.log("about to return");
    return result;
}

function cacheElementsForPValue(pValue, script) {
    var child = exec("Rscript " + script + " --args \"" + pValue + "\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }

        var parsed = getWeightsAndDegreesFromROutput(stdout);
        console.log("returned");
        var elements = createElements(parsed.epiDegrees, parsed.stromaDegrees, parsed.weights,
            parsed.geneNames);

        var allInfo = {
            elements: elements,
            totalInteractions: parsed.totalInteractions,
            epiToStromaInteractions: parsed.epiToStromaInteractions,
            stromaToEpiInteractions: parsed.stromaToEpiInteractions
        }

        initialElements[pValue] = allInfo;

    });
}

function createListOfSelfLoopGenes(pValue, script) {
    var child = exec("Rscript " + script + " --args \"" + pValue + "\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }

        var parsedValue = JSON.parse(stdout);
        var geneNames = parsedValue.value[0].value;
        var numberOfLoops = parsedValue.value[1].value[0];
        var allInfo = {
            geneNames: geneNames,
            numberOfLoops: numberOfLoops
        };

        selfLoopGeneNames[pValue] = allInfo;
    });
}

function createAllOverallConfigs() {
    var pValues = ["001", "01", "05", "1"];

    for (var i = 0; i < pValues.length; i++) {
        cacheElementsForPValue(pValues[i], "R_Scripts/getWeightsAndDegrees.R");
        createListOfSelfLoopGenes(pValues[i], "R_Scripts/getSelfLoopGeneNames.R");
    }
}

function initializeServer() {
    createAndStoreCorrelationsAndDegrees(createAllOverallConfigs);
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

        callback();
    });
}

app.listen(5000, function() {
    console.log("Listening on port 5000");
    console.log("Initializing data and config")
    initializeServer();
});
