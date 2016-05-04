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
    var child = exec("Rscript C:/Users/Alex/Documents/RNode/test.R", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        //console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }

        var parsedValue = JSON.parse(stdout);
        var dimension = parsedValue.attributes.dim.value[0];
        var geneNames = parsedValue.attributes.dimnames.value[0].value;
        //console.log(geneNames);

        for (var i = 0; i < geneNames.length; i++) {
            initialEpiGenes.push({
                name: geneNames[i] + '-e',
                degree: 0
            });
        }

        for (var i = 0; i < geneNames.length; i++) {
            initialStromaGenes.push({
                name: geneNames[i] + '-s',
                degree: 0
            });
        }

        for (var i = 0; i < dimension; i++) {
            var temp = [];
            for (var j = 0; j < dimension; j++) {
                temp.push(parsedValue.value[(dimension * i) + j]);
            }

            initialWeights.push(temp);
        }

        var elements = [];
        var epiNodes = createNodes(initialEpiGenes, 'epi', 1);
        //console.log("Epi Nodes: " + epiNodes);
        var stromaNodes = createNodes(initialStromaGenes, 'stroma', 2);
        var edges = createEdges(initialEpiGenes, initialStromaGenes, initialWeights);
        //console.log("Edges: " + edges);

        elements = elements.concat(epiNodes);
        elements = elements.concat(stromaNodes);
        elements = elements.concat(edges);
        elements.push({
            data: {
                id: 'epi'
            },
            selected: true,
            selectable: true
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
            edges: edges
        });
    });

});

app.post('/first-dropdown', function(req, res) {
    if (initialWeights == null || initialEpiGenes == null || initialStromaGenes == null) {
        res.json({ result: null });
    }

    //console.log(req);
    console.log(req.body);
    var gene = req.body.gene;
    var side = req.body.side;
    var child = exec(
        "Rscript C:/Users/Alex/Documents/angular-seed/R_Scripts/findCorrelations.R --args " +
        "\"" + gene +
        "\"" + " " + "\"" + side + "\"", { maxBuffer: 1024 * 50000 },
        function(error, stdout, stderr) {
            var elements = [];
            elements.
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var neighbourGeneNames = parsedValue.attributes.names.value;
            var neighboursGenes = [];

            for (var i = 0; i < neighbourGeneNames.length; i++) {
                neighboursGenes.push({
                    name: neighbourGeneNames[i] + '-e',
                    degree: 0
                });
            }
            /*var dimension = parsedValue.attributes.dim.value[0];
            var geneNames = parsedValue.attributes.dimnames.value[0].value;*/
            console.log(stdout);
        });
});

/*
function searchGenes(gene, genes) {
    for
}*/

function createConfig(elements) {
    initialConfig = {
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
    return initialConfig;
    //$scope.applyConfig(initialConfig);
};

function createNodes(nodes, parent, column) {
    var resultNodes = [];

    for (var i = 0; i < nodes.length; i++) {
        resultNodes.push({
            data: {
                id: nodes[i].name,
                parent: parent
            },
            position: {
                x: 100 * column,
                y: 100 + (i * 25)
            },
            style: {
                'width': (10 + nodes[i].degree) + 'px',
                'height': (10 + nodes[i].degree) + 'px',
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
                        source: epiNodes[i].name,
                        target: stromaNodes[j].name
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
                        source: stromaNodes[i].name,
                        target: epiNodes[j].name
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
                    source: stromaNodes[i].name,
                    target: epiNodes[j].name
                },
                style: {
                    'curve-style': 'haystack'
                }
            });
        }
    }

    return edges;
};

app.listen(5000, function() {
    console.log("Listening on port 5000");
});
