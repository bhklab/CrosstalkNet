var exec = require('child_process').exec;
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
var nodeModel = {
    name: null,
    degree: 0,
    neighbours: []
};

var initialConfig = null;
var initialEpiGenes = [];
var initialStromaGenes = [];
var initialWeights = [];
var initialDegrees = {};
var weightMap = null;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/data', function(req, res) {
    var child = exec("Rscript C:/Users/Alex/Documents/RNode/test.R", function(error, stdout,
        stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }

        res.json({ result: JSON.parse(stdout) });
    });

    /*
    var r = c.spawn("R", "");
    r.stdin.write("setwd('C:/Users/Alex/Documents/RNode')");
    r.stdin.write("source('test.R'");
    var result = '';
    r.stdout.on('data', function(data) {
        result += data.toString();
        console.log(result)
        
    });*/
});

app.get('/test-correlation', function(req, res) {
    if (initialConfig != null) {
        res.json({ config: initialConfig });
        return;
    }
    var child = exec("Rscript R_Scripts/test.R", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }


        var parsedValue = JSON.parse(stdout);
        var epiDegrees = parsedValue.value[0].value[0].value;
        var stromaDegrees = parsedValue.value[0].value[1].value;
        var weights = parsedValue.value[1];

        console.log(parsedValue);
        var dimension = weights.attributes.dim.value[0];
        var geneNames = weights.attributes.dimnames.value[0].value;
        //console.log(geneNames);

        for (var i = 0; i < dimension; i++) {
            var temp = [];
            for (var j = 0; j < dimension; j++) {
                temp.push(weights.value[(dimension * i) + j]);
            }

            initialWeights.push(temp);
        }

        console.log('epiDegrees[0]: ' + epiDegrees[0]);
        console.log('stromaDegrees[0]: ' + stromaDegrees[0]);
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
        //console.log(initialConfig);


        res.json({
            weights: initialWeights,
            stromaNodes: stromaNodes,
            epiNodes: epiNodes,
            config: initialConfig,
            edges: edges,
            parsedValue: parsedValue
        });
    });
});

app.post('/first-dropdown', function(req, res) {
    if (initialWeights == null || initialEpiGenes == null || initialStromaGenes == null) {
        res.json({ result: null });
    }

    console.log(req.body);
    var gene = req.body.gene;
    var side = req.body.side;
    var degree = req.body.degree;

    var neighbourSide = side == "-e" ? "-s" : "-e"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene +
        "\"" + " " + "\"" + side + "\"", { maxBuffer: 1024 * 50000 },
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
    if (initialWeights == null || initialEpiGenes == null || initialStromaGenes == null) {
        res.json({ result: null });
    }

    console.log(req.body);
    var gene = req.body.gene;
    var side = req.body.side;
    var degree = req.body.degree;
    var originalElements = req.body.originalElements;

    var neighbourSide = side == "-e" ? "-s" : "-e"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene +
        "\"" + " " + "\"" + side + "\"", { maxBuffer: 1024 * 50000 },
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

    //elemCopy = angular.copy(elements);
    return config;
    //$scope.applyConfig(initialConfig);
};

function createNodes(nodes, parent, column, degrees) {
    var resultNodes = [];
    var sideFlag = "";//parent == "epi" || parent == "epiRight" ? "-e" : "-s";
    if (parent == "epi") {
        sideFlag = "-e";
    } else if (parent == "epiRight") {
        sideFlag = "-er";
    } else if (parent == "stroma")  {
        sideFlag = "-s";
    }
    else if (parent = "stromaRight") {
        sideFlag = "-sr";
    }

    for (var i = 0; i < nodes.length; i++) {
        console.log(degrees[i]);
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

app.listen(5000, function() {
    console.log("Listening on port 5000");
});
