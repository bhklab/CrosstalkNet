var exec = require('child_process').exec;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();

var initialConfig = null;
var initialConfigs = { "001": null, "01": null, "05": null, "1": null };

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/overall-graph', function(req, res) {
    var pValue = req.query.pValue;
    console.log(pValue);
    console.log(initialConfigs);
    if (initialConfigs[pValue] != null) {
        console.log(initialConfigs[pValue].elements[9]);
        res.json({ config: initialConfigs[pValue] });
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
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + pValue + "\"", { maxBuffer: 1024 *
                50000 },
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

            var neighbourNodes = createNodes(neighbourGeneNames, side == "-e" ?
                "stroma" :
                "epi", 4, degrees);
            var sourceNode = createNodes([gene], side == "-e" ? "epi" : "stroma", 1, [
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
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + pValue + "\"", { maxBuffer: 1024 * 50000 },
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

            var neighbourNodes = createNodes(neighbourGeneNames, side == "-e" ?
                "stromaRight" :
                "epiRight", 8, degrees);

            var sourceNode = createNodes([gene], side == "-e" ? "epi" : "stroma", 1, [
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

function createNodes(nodes, parent, column, degrees) {
    var resultNodes = [];
    var sideFlag = ""; //parent == "epi" || parent == "epiRight" ? "-e" : "-s";
    if (parent == "epi") {
        sideFlag = "-e";
    } else if (parent == "epiRight") {
        sideFlag = "-er";
    } else if (parent == "stroma") {
        sideFlag = "-s";
    } else if (parent = "stromaRight") {
        sideFlag = "-sr";
    }

    for (var i = 0; i < nodes.length; i++) {
        resultNodes.push({
            data: {
                id: nodes[i] + sideFlag,
                degree: degrees[i],
                parent: parent
            },
            position: {
                x: 100 * column,
                y: 100 + (i * 20)
            },
            style: {
                'width': '10px', //(10 + nodes[i].degree) + 'px',
                'height': '10px', //(10 + nodes[i].degree) + 'px',
                'text-halign': column == 1 ? "left" : "right",
                'text-valign': 'center'
            }
        })
    }

    return resultNodes;
};

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
                    },
                    style: {
                        'curve-style': 'haystack'
                    }
                });
            }

            if (weights[j][i] > 0) {
                edges.push({
                    data: {
                        id: 'StromaToEpi' + i + j,
                        source: stromaNodes[i].data.id,
                        target: epiNodes[j].data.id
                    },
                    style: {
                        'curve-style': 'haystack'
                    }
                });
            }
        }

        if (weights[i][i] > 0) {
            edges.push({
                data: {
                    id: 'StromaToEpi' + i + j,
                    source: stromaNodes[i].data.id,
                    target: epiNodes[i].data.id
                },
                style: {
                    'curve-style': 'haystack'
                }
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
    var epiNodes = createNodes(geneNames, 'epi', 1, epiDegrees);
    var stromaNodes = createNodes(geneNames, 'stroma', 2, stromaDegrees);
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

    var result = {
        epiDegrees: epiDegrees,
        stromaDegrees: stromaDegrees,
        weights: weights,
        geneNames: geneNames
    }

    console.log("about to return");
    return result;
}

function createAllOverallConfigs() {
    
    var child = exec("Rscript R_Scripts/getWeightsAndDegrees.R --args \"001\"", {
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

        initialConfigs["001"] = config;

    });

    var child = exec("Rscript R_Scripts/getWeightsAndDegrees.R --args \"01\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }


        var parsed = getWeightsAndDegreesFromROutput(stdout);
        var elements = createElements(parsed.epiDegrees, parsed.stromaDegrees, parsed.weights,
            parsed.geneNames);
        var config = createConfig(elements);

        initialConfigs["01"] = config;

    });

    var child = exec("Rscript R_Scripts/getWeightsAndDegrees.R --args \"05\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }


        var parsed = getWeightsAndDegreesFromROutput(stdout);
        var elements = createElements(parsed.epiDegrees, parsed.stromaDegrees, parsed.weights,
            parsed.geneNames);
        var config = createConfig(elements);

        initialConfigs["05"] = config;

    });

    var child = exec("Rscript R_Scripts/getWeightsAndDegrees.R --args \"1\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }


        var parsed = getWeightsAndDegreesFromROutput(stdout);
        var elements = createElements(parsed.epiDegrees, parsed.stromaDegrees, parsed.weights,
            parsed.geneNames);
        var config = createConfig(elements);

        initialConfigs["1"] = config;

    });
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

        /*
        var parsedValue = JSON.parse(stdout);
        var epiDegrees = parsedValue.value[0].value[0].value;
        var stromaDegrees = parsedValue.value[0].value[1].value;
        var weights = parsedValue.value[1];

        var dimension = weights.attributes.dim.value[0];
        var geneNames = weights.attributes.dimnames.value[0].value;
        var initialWeights = [];

        for (var i = 0; i < dimension; i++) {
            var temp = [];
            for (var j = 0; j < dimension; j++) {
                temp.push(weights.value[(dimension * i) + j]);
            }

            initialWeights.push(temp);
        }

        var elements = [];
        var epiNodes = createNodes(geneNames, 'epi', 1, epiDegrees);
        var stromaNodes = createNodes(geneNames, 'stroma', 2, stromaDegrees);
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

        initialConfig = createConfig(elements);
        console.log("Data and config initialized. Ready to serve requests")*/
        callback();
    });
}

app.listen(5000, function() {
    console.log("Listening on port 5000");
    console.log("Initializing data and config")
    initializeServer();
});
