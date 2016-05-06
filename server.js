var exec = require('child_process').exec;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
var nodeUtils = require('nodeUtils');

var initialConfig = null;
var initialConfigs = { "001": null, "01": null, "05": null, "1": null };
var selfLoopGeneNames = { "001": null, "01": null, "05": null, "1": null };

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/overall-graph', function(req, res) {
    var pValue = req.query.pValue;
    console.log(pValue);
    console.log(initialConfigs);
    if (initialConfigs[pValue] != null) {
        //console.log(initialConfigs[pValue].elements[9]);
        res.json({
            config: initialConfigs[pValue].config,
            totalInteractions: initialConfigs[pValue].totalInteractions,
            epiToStromaInteractions: initialConfigs[pValue].epiToStromaInteractions,
            stromaToEpiInteractions: initialConfigs[pValue].stromaToEpiInteractions
        });
        return;
    }
});

app.get('/self-loops', function(req, res) {
    var pValue = req.query.pValue;
    console.log(pValue);
    if (selfLoopGeneNames[pValue] != null) {
        //console.log(initialConfigs[pValue].elements[9]);
        res.json({
            geneNames: selfLoopGeneNames[pValue].geneNames,
            numberOfLoops: selfLoopGeneNames[pValue].numberOfLoops
        });
        return;
    }
});

app.post('/first-dropdown', function(req, res) {
    /*if (initialConfig == null) {
        res.json({ result: null });
    }*/

    console.log(req.body);
    var gene = req.body.gene;
    var side = req.body.side;
    var degree = req.body.degree;
    var pValue = req.body.pValue;

    var neighbourSide = side == "-e" ? "-s" : "-e"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene +
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + pValue + "\"", {
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

            /*
            if (parsedValue.attributes == null || parsedValue.attributes.names == null) {
                res.json({ config: initialConfig });
                return;
            }*/

            var weights = parsedValue.value[0];
            var degrees = parsedValue.value[1].value;
            var neighbourGeneNames = weights.attributes.names.value;
            var dimension = neighbourGeneNames.length;
            var neighbourGeneWeights = weights.value;
            var neighboursGenes = [];
            var resultWeights = [];

            /*
            if (neighbourGeneWeights.length == 0) {
                res.json({ config: initialConfig });
                return;
            }*/

            var neighbourNodes = nodeUtils.createNodes(neighbourGeneNames, side == "-e" ?
                "stroma" :
                "epi", 3, degrees);
            var sourceNode = nodeUtils.createNodes([gene], side == "-e" ? "epi" : "stroma", 1, [
                degree
            ]);
            var edges = createEdgesFromNode(sourceNode[0], neighbourNodes,
                neighbourGeneWeights,
                "");

            elements = elements.concat(sourceNode);
            elements = elements.concat(neighbourNodes);
            elements = elements.concat(edges);
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

            var config = createConfig(elements);

            res.json({ config: config });
        });
});

app.post('/second-dropdown', function(req, res) {
    console.log(req.body);
    var gene = req.body.gene;
    var side = req.body.side;
    var degree = req.body.degree;
    var originalElements = req.body.originalElements;
    var pValue = req.body.pValue;

    var neighbourSide = side == "-e" ? "-s" : "-e"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene +
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + pValue + "\"", {
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

            if (parsedValue.attributes == null || parsedValue.attributes.names == null) {
                res.json({ config: initialConfig });
                return;
            }

            var weights = parsedValue.value[0];
            var degrees = parsedValue.value[1].value;
            var neighbourGeneNames = weights.attributes.names.value;
            var dimension = neighbourGeneNames.length;
            var neighbourGeneWeights = weights.value;
            var neighboursGenes = [];
            var resultWeights = [];

            if (neighbourGeneWeights.length == 0) {
                res.json({ config: initialConfig });
                return;
            }

            var neighbourNodes = nodeUtils.createNodes(neighbourGeneNames, side == "-e" ?
                "stromaRight" :
                "epiRight", 6, degrees);

            var sourceNode = nodeUtils.createNodes([gene], side == "-e" ? "epi" : "stroma", 1, [
                degree
            ]);

            console.log(sourceNode);
            var edges = createEdgesFromNode(sourceNode[0], neighbourNodes,
                neighbourGeneWeights,
                "");

            elements = elements.concat(neighbourNodes);
            elements = elements.concat(edges);
            elements = elements.concat(originalElements);
            elements.push({
                data: {
                    id: side == '-e' ? 'stromaRight' : 'epiRight'
                }
            });

            var config = createConfig(elements);

            res.json({ config: config });
        });
});

app.post('/neighbour-general', function(req, res) {
    console.log(req.body);
    var neighbour = req.body.neighbour;
    var gene = req.body.gene;
    var side = req.body.side;
    var degree = req.body.degree;
    var originalElements = req.body.originalElements;
    var pValue = req.body.pValue;

    var neighbourSide = side == "-e" ? "-s" : "-e"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene +
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + pValue + "\"", {
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
            var neighbourNodes = nodeUtils.createNodes(neighbourGeneNames, parent, neighbour == 1 ?
                4 : 8, degrees);
            neighbourNodes = nodeUtils.addPositionsToNodes(neighbourNodes, neighbour == 1 ? 400 : 800, 100, 0, 20);
            neighbourNodes = nodeUtils.addStyleToNodes(neighbourNodes, 10, 10, "left", "center", neighbourBgColor);

            var sourceNode = nodeUtils.createNodes([gene], side == "-e" ? "epi" : "stroma", 1, [
                degree
            ]);
            var sourceBgColor = side == "-e" ? "blue" : "red";
            sourceNode = nodeUtils.addPositionsToNodes(sourceNode, 100, 100, 0, 0);
            sourceNode = nodeUtils.addStyleToNodes(sourceNode, 10, 10, "left", "center", sourceBgColor);

            console.log(sourceNode);
            var edges = createEdgesFromNode(sourceNode[0], neighbourNodes,
                neighbourGeneWeights,
                "");

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
                elements.push({
                    data: {
                        id: side == '-e' ? 'stromaRight' : 'epiRight'
                    }
                });
            }

            elements = elements.concat(neighbourNodes);
            elements = elements.concat(edges);

            var config = createConfig(elements);

            res.json({ config: config });
        });
});

function createConfig(elements) {
    var config = {
        elements: elements,
        layout: {
            name: 'preset'
        },
        motionBlur: true,
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        textureOnViewport: true,
        style: [{
            selector: 'node',
            style: {
                'content': 'data(id)',
                'font-size': '8px'
            }
        }, {
            selector: ':parent',
            style: {
                'background-opacity': 0.6
            }
        }, {
            selector: 'node:selected',
            style: {
                'background-color': 'red'
            }
        }]
    };

    return config;
};



/*  For now, xPattern and yPattern will simply be increments to add at every step of the loop
 */


function createEdges(epiNodes, stromaNodes, weights) {
    var edges = [];

    for (var i = 0; i < epiNodes.length; i++) {
        for (var j = i + 1; j < stromaNodes.length; j++) {
            if (weights[i][j] > 0) {
                edges.push({
                    data: {
                        id: 'EpiToStroma' + i + j,
                        source: epiNodes[i].data.id,
                        target: stromaNodes[j].data.id
                    }
                    /*,
                                        style: {
                                            'curve-style': 'haystack'
                                        }*/
                });
            }

            if (weights[j][i] > 0) {
                edges.push({
                    data: {
                        id: 'StromaToEpi' + i + j,
                        source: stromaNodes[i].data.id,
                        target: epiNodes[j].data.id
                    }
                    /*,
                                        style: {
                                            'curve-style': 'haystack'
                                        }*/
                });
            }
        }

        if (weights[i][i] > 0) {
            edges.push({
                data: {
                    id: 'StromaToEpi' + i + j,
                    source: stromaNodes[i].data.id,
                    target: epiNodes[i].data.id
                }
                /*,
                                style: {
                                    'curve-style': 'haystack'
                                }*/
            });
        }
    }

    return edges;
};

function createEdgesFromNode(node, neighbours, weights, from) {
    var edges = [];
    var idPrefix = node.data.parent == "epi" ? "EpiToStroma" : "StromaToEpi";
    for (var i = 0; i < neighbours.length; i++) {
        edges.push({
            data: {
                id: idPrefix + i,
                source: node.data.id,
                target: neighbours[i].data.id,
                weight: weights[i]
            },
            style: {
                'curve-style': 'haystack'
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

    var elements = [];
    var epiNodes = nodeUtils.createNodes(geneNames, 'epi', 1, epiDegrees);
    epiNodes = nodeUtils.addPositionsToNodes(epiNodes, 100, 100, 0, 20);
    epiNodes = nodeUtils.addStyleToNodes(epiNodes, 10, 10, "left", "center", "blue");
    var stromaNodes = nodeUtils.createNodes(geneNames, 'stroma', 2, stromaDegrees);

    stromaNodes = nodeUtils.addPositionsToNodes(stromaNodes, 300, 100, 0, 20);
    stromaNodes = nodeUtils.addStyleToNodes(stromaNodes, 10, 10, "right", "center", "red");

    var edges = createEdges(epiNodes, stromaNodes, initialWeights);

    elements = elements.concat(epiNodes);
    elements = elements.concat(stromaNodes);
    elements = elements.concat(edges);
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

function createConfigForPValue(pValue, script) {
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
        var config = createConfig(elements);
        var allInfo = {
            config: config,
            totalInteractions: parsed.totalInteractions,
            epiToStromaInteractions: parsed.epiToStromaInteractions,
            stromaToEpiInteractions: parsed.stromaToEpiInteractions
        }

        initialConfigs[pValue] = allInfo;

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
        createConfigForPValue(pValues[i], "R_Scripts/getWeightsAndDegrees.R");
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
