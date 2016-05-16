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
    var requestedLayout = req.query.layout;

    var minPositiveWeight = req.query.minPositiveWeight;
    var minNegativeWeight = req.query.minNegativeWeight;

    if (initialElements[pValue] != null) {
        var config = createOverallConfig(initialElements[pValue],
            requestedLayout);

        res.json({
            config: config,
            totalInteractions: initialElements[pValue].totalInteractions,
            minPositiveWeight: initialElements[pValue].minPositiveWeight,
            maxPositiveWeight: initialElements[pValue].maxPositiveWeight,
            minNegativeWeight: initialElements[pValue].minNegativeWeight,
            maxNegativeWeight: initialElements[pValue].maxNegativeWeight
        });
    } else {

    }
});

app.get('/overall-graph-weight-filter', function(req, res) {
    var pValue = req.query.pValue;
    var requestedLayout = 'random'; //req.query.layout;
    var minPositiveWeight = req.query.minPositiveWeight;
    var minNegativeWeight = req.query.minNegativeWeight;
    var filter = 'yes';

    if (minNegativeWeight === "NA" && minPositiveWeight === "NA") {
        filter = 'no';
    }

    var child = exec("Rscript R_scripts/getWeightsAndDegreesFilterByWeight.R" +
        " --args \"" +
        pValue + "\"" + " " + "\"" + minNegativeWeight + "\"" + " " + "\"" +
        minPositiveWeight + "\"" + " " + "\"" + filter + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var allInfo = extractElementsAndInteractions(stdout);

            var config = createOverallConfig(allInfo.elements, requestedLayout);

            res.json({
                config: config,
                totalInteractions: allInfo.totalInteractions,
                maxPositiveWeight: allInfo.maxPositiveWeight,
                minPositiveWeight: allInfo.minPositiveWeight,
                maxNegativeWeight: allInfo.maxNegativeWeight,
                minNegativeWeight: allInfo.minNegativeWeight

            });
        });
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

app.post('/final-neighbour-general', function(req, res) {
    var selectedGenes = req.body.selectedGenes;
    var pValue = req.body.pValue;
    var numberOfGenes = selectedGenes.length;
    var genesArg = "";

     if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Error" });
        return;
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        genesArg = genesArg + " " + "\"" + selectedGenes[i] + "\"";
    }

    var child = exec("Rscript R_scripts/findCorrelationsNew.R --args" + " " + "\"" + numberOfGenes + "\"" + genesArg + " " + "\"" + pValue + "\"", { maxBuffer: 1024 * 50000 },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var weights = parsedValue.value[0].value;
            var degrees = parsedValue.value[1].value;
            console.log(weights);
            console.log(degrees);
            var sourceNodes = [];
            var nodes = {};
            var parentNodes = [];
            var edges = [];
            var elements = [];

            //geneNames.epiGeneNames = parsedValue.value[0].value[0].attributes.names.value;

            for (var i = 0; i < selectedGenes.length + 1; i++) {
                parentNodes.push({
                    data: {
                        id: "par" + i
                    }
                });
            }

            for (var i = 0; i < selectedGenes.length; i++) {
                sourceNodes.push(nodeUtils.createNodes([selectedGenes[i]], 'par' + i, 0, 0));
            }

            for (var i = 0; i < weights.length; i++) {
                nodes["" + i] = nodeUtils.createNodes(weights[i].attributes.names.value, "par" + (i + 1), 0, degrees[i].value);
            }

            var i = 0;

            for (nodeCollection in nodes) {
                edges = edges.concat(edgeUtils.createEdgesFromNode(sourceNodes[i][0], nodes["" + i], weights[i].value));
                i++;
            }

            elements = elements.concat(parentNodes);
            elements = elements.concat(edges);
            elements.push(sourceNodes[0][0]);

            for (nodeCollection in nodes) {
                elements = elements.concat(nodes[nodeCollection]);
            }

            res.json({elements: elements});
        });
});

app.post('/new-neighbour-general', function(req, res) {
    var side = req.body.side.toUpperCase();
    var pValue = req.body.pValue;
    var requestedLayout = req.body.layout;
    var firstGeneName = req.body.first;
    var secondGeneName = req.body.second;
    var firstParent = "";
    var secondParent = "";

    if (secondGeneName.toLowerCase() == "null") {
        firstParent = side == "-E" ? "stroma" : "epi";
    } else {
        firstParent = side == "-E" ? "epi" : "stroma";
        secondParent = side == "-E" ? "stromaRight" : "epiRight";
    }

    var child = exec("Rscript R_scripts/findCorrelationsComplete.R --args " +
        "\"" + firstGeneName.toUpperCase() + "\"" + " " + "\"" + secondGeneName.toUpperCase() +
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + pValue + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var config = null;
            var layout = null;
            var elements = [];
            var firstNeigboursBgColor = firstParent == "epi" ? "red" : "blue";
            var secondNeigboursBgColor = secondParent == "epiRight" ? "red" : "blue";
            var firstSourceNode = null;
            var secondSourceNode = null;

            var firstNeighboursNodes = [];
            var firstNeighboursEdges = [];
            var secondNeighboursNodes = [];
            var secondNeighboursEdges = [];

            var parsedValue = JSON.parse(stdout);
            console.log(parsedValue);

            var firstNeighboursWeights = parsedValue.value[0].value;
            var firstNeighboursDegrees = parsedValue.value[2].value;
            var firstNeighboursGeneNames = parsedValue.value[0].attributes.names.value;

            var secondNeighboursWeights = [];
            var secondNeighboursDegrees = [];
            var secondNeighboursGeneNames = [];

            if (secondGeneName.toLowerCase() != 'null') {
                secondNeighboursWeights = parsedValue.value[1].value;
                secondNeighboursDegrees = parsedValue.value[3].value;
                secondNeighboursGeneNames = parsedValue.value[1].attributes.names.value;

                secondSourceNode = nodeUtils.createNodes([secondGeneName], side == "-E" ?
                    "epi" : "stroma", 4, [0]);

                secondNeighboursNodes = nodeUtils.createNodes(secondNeighboursGeneNames,
                    secondParent, 8, secondNeighboursDegrees);

                secondNeighboursEdges = edgeUtils.createEdgesFromNode(secondSourceNode[
                    0], secondNeighboursNodes, secondNeighboursWeights, false);
            }

            var temp = side == "-E" ? "epi" : "stroma";

            if (secondGeneName != "null") {
                if (side == "-E") {

                    temp = "stroma"
                } else {

                    temp = "epi"
                }
            }

            firstSourceNode = nodeUtils.createNodes([firstGeneName], temp, 1, [
                0 //degree
            ]);

            firstNeighboursNodes = nodeUtils.createNodes(firstNeighboursGeneNames,
                firstParent,
                4, firstNeighboursDegrees);

            firstNeighboursEdges = edgeUtils.createEdgesFromNode(firstSourceNode[0],
                firstNeighboursNodes, firstNeighboursWeights, false);

            if (requestedLayout == 'hierarchical' || requestedLayout == 'preset' || requestedLayout == 'random') {
                firstNeighboursNodes = nodeUtils.addPositionsToNodes(
                    firstNeighboursNodes,
                    400, 100, 0, 20);

                firstNeighboursNodes = nodeUtils.addStyleToNodes(firstNeighboursNodes,
                    10, 10,
                    "left",
                    "center", firstNeigboursBgColor);

                firstSourceNode = nodeUtils.addPositionsToNodes(firstSourceNode, 100,
                    100, 0, 0);
                firstSourceNode = nodeUtils.addStyleToNodes(firstSourceNode, 10, 10,
                    "left",
                    "center",
                    firstNeigboursBgColor == "blue" ? "red" : "blue");

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

                if (secondGeneName != "null") {
                    elements.push({
                        data: {
                            id: side == '-E' ? 'stromaRight' : 'epiRight'
                        }
                    });

                    secondNeighboursNodes = nodeUtils.addPositionsToNodes(
                        secondNeighboursNodes,
                        800, 100, 0, 20);

                    secondNeighboursNodes = nodeUtils.addStyleToNodes(
                        secondNeighboursNodes,
                        10, 10,
                        "right",
                        "center", secondNeigboursBgColor);
                }
            }

            console.log("First neighbours nodes:");
            console.log(firstNeighboursNodes);
            console.log("Second neighbours nodes:");
            console.log(secondNeighboursNodes);
            elements = elements.concat(firstSourceNode);
            elements = elements.concat(firstNeighboursNodes);
            elements = elements.concat(firstNeighboursEdges);
            elements = elements.concat(secondNeighboursNodes);
            elements = elements.concat(secondNeighboursEdges);

            config = configUtils.createConfig();

            configUtils.setConfigElements(config, elements);

            if (requestedLayout == "hierarchical" || requestedLayout == 'preset' || requestedLayout == 'random') {
                layout = configUtils.createPresetLayout();
            } else if (requestedLayout == "concentric") {
                layout = configUtils.createConcentricLayout(firstSourceNode[0].data
                    .id);
            }

            configUtils.setConfigLayout(config, layout);
            res.json({ config: config });
        });
});

app.get('/submatrix', function(req, res) {
    var genes = req.query.genes;
    var pValue = req.query.pValue;

    if (!(genes instanceof Array)) {
        genes = [genes];
    } else if (genes == null || genes == "" || genes == []) {
        res.json({ error: "Error" });
        return;
    }

    console.log(req.query);
    var geneArgs = "";

    for (var i = 0; i < genes.length; i++) {
        geneArgs = geneArgs + " " + "\"" + genes[i] + "\"";
    }

    var child = exec("Rscript R_Scripts/getRelevantSubmatrix.R --args " +
        "\"" + pValue + "\"" + " " + "\"" + genes.length + "\"" + geneArgs, {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            console.log(stdout);
            var allInfo = extractElementsAndInteractions(stdout);

            var config = createOverallConfig(allInfo.elements,
                "random");

            res.json({
                config: config,
                totalInteractions: allInfo.totalInteractions,
                minPositiveWeight: allInfo.minPositiveWeight,
                maxPositiveWeight: allInfo.maxPositiveWeight,
                minNegativeWeight: allInfo.minNegativeWeight,
                maxNegativeWeight: allInfo.maxNegativeWeight
            });
        });
});

function extractElementsAndInteractions(stdout) {
    var parsed = getWeightsAndDegreesFromROutput(stdout);
    var elements = createElements(parsed.epiDegrees, parsed.stromaDegrees,
        parsed.weights,
        parsed.geneNames);

    var allInfo = {
        elements: elements,
        totalInteractions: parsed.totalInteractions,
        minPositiveWeight: parsed.minPositiveWeight,
        maxPositiveWeight: parsed.maxPositiveWeight,
        minNegativeWeight: parsed.minNegativeWeight,
        maxNegativeWeight: parsed.maxNegativeWeight
    };

    return allInfo;
}

function buildStringArgs(script, args) {
    var stringArgs = "";
}
/*  For now, xPattern and yPattern will simply be increments to add at every step of the loop
 */
function createOverallConfig(originalElements, requestedLayout) {
    var config = null;
    var configLayout = null;

    if (originalElements != null) {
        var elements = originalElements.elements != null ? copyUtils.createElementsCopy(
            originalElements.elements) : copyUtils.createElementsCopy(
            originalElements);
        config = configUtils.createConfig(elements);
        if (requestedLayout == 'preset') {
            elements.epiNodes = nodeUtils.addPositionsToNodes(elements.epiNodes, 100,
                100,
                0, 20);
            elements.epiNodes = nodeUtils.addStyleToNodes(elements.epiNodes, 10, 10,
                "left",
                "center", "blue");

            elements.stromaNodes = nodeUtils.addPositionsToNodes(elements.stromaNodes,
                300,
                100, 0,
                20);
            elements.stromaNodes = nodeUtils.addStyleToNodes(elements.stromaNodes, 10,
                10,
                "right",
                "center",
                "red");

            configUtils.setConfigElements(config, elements);
            configLayout = configUtils.createPresetLayout();
            configUtils.setConfigLayout(config, configLayout);


        } else if (requestedLayout == 'random') {
            elements.epiParent = null;
            elements.stromaParent = null;
            configUtils.setConfigElements(config, elements);
            configLayout = configUtils.createRandomLayout(elements.epiNodes.length + elements.stromaNodes.length);
            configUtils.setConfigLayout(config, configLayout);
            var epiColor = {
                'selector': 'node[id$="-E"], node[id$="-Er"]',
                'style': {
                    'background-color': 'red'
                }
            };

            var stromaColor = {
                'selector': 'node[id$="-S"], node[id$="-sr"]',
                'style': {
                    'background-color': 'blue'
                }
            };

            configUtils.addStyleToConfig(config, epiColor);
            configUtils.addStyleToConfig(config, stromaColor);
        }
    }

    return config;
}

function createElements(epiDegrees, stromaDegrees, weights, geneNames) {
    var initialWeights = [];
    var dimension = geneNames.length;
    var epiGeneNames = [];
    var stromaGeneNames = [];

    if (geneNames.epiGeneNames != null) {
        epiGeneNames = geneNames.epiGeneNames;
        stromaGeneNames = geneNames.stromaGeneNames;
    } else {
        epiGeneNames = geneNames;
        stromaGeneNames = geneNames;
    }

    //console.log(weights.value);
    console.log("Dimension: " + dimension);
    for (var i = 0; i < epiGeneNames.length; i++) {
        var temp = [];
        for (var j = 0; j < stromaGeneNames.length; j++) {
            temp.push(weights.value[(epiGeneNames.length * j) + i]);
        }

        initialWeights.push(temp);
    }

    var elements = {
        epiNodes: null,
        stromaNodes: null,
        edges: null,
        epiParent: null,
        stromaParent: null
    };
    var epiNodes = nodeUtils.createNodes(epiGeneNames, 'epi', 1, epiDegrees);
    var stromaNodes = nodeUtils.createNodes(stromaGeneNames, 'stroma', 2, stromaDegrees);

    /*
    console.log(epiNodes);
    console.log(stromaNodes);*/

    var edges = edgeUtils.createEdges(epiNodes, stromaNodes, initialWeights);

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

function getNeighbourWeightsAndDegrees(stdout) {
    var parsedValue = JSON.parse(stdout);
    var weights = parsedValue.value[0].value;
    var degrees = parsedValue.value[1].value;

    return { weights: weights, degrees: degrees };
}

function getWeightsAndDegreesFromROutput(stdout) {
    var parsedValue = JSON.parse(stdout);
    var epiDegrees = parsedValue.value[0].value[0].value;
    var stromaDegrees = parsedValue.value[0].value[1].value;
    var weights = parsedValue.value[1];
    var geneNames = { epiGeneNames: null, stromaGeneNames: null }; //weights.attributes.dimnames.value[0].value;

    geneNames.epiGeneNames = parsedValue.value[0].value[0].attributes.names.value;
    geneNames.stromaGeneNames = parsedValue.value[0].value[1].attributes.names.value;

    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1");
    console.log(parsedValue.value[0].value[0].attributes.names.value);
    console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!1");

    var totalInteractions = parsedValue.value[2].value[0];
    var minPositiveWeight = parsedValue.value[3].value[0];
    var maxPositiveWeight = parsedValue.value[4].value[0];
    var minNegativeWeight = parsedValue.value[5].value[0];
    var maxNegativeWeight = parsedValue.value[6].value[0];

    var result = {
        epiDegrees: epiDegrees,
        stromaDegrees: stromaDegrees,
        weights: weights,
        geneNames: geneNames,
        totalInteractions: totalInteractions,
        minPositiveWeight: minPositiveWeight,
        maxPositiveWeight: maxPositiveWeight,
        minNegativeWeight: minNegativeWeight,
        maxNegativeWeight: maxNegativeWeight
    };

    console.log("about to return");
    return result;
}
/*
function generalOutputParser(json) {
    if (json.attributes == null || json.attributes.names == null) {
        return null;
    }

    var names = json.attributes.names.value;

    for (var i = 0; i < names; i++) {
        if ()
    }
}*/

function cacheElementsForPValue(pValue, script) {
    var child = exec("Rscript " + script + " --args \"" + pValue + "\"" + " " + "\"NA" +
        "\"" + " " +
        "\"NA" + "\"" + " " + "\"no\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var allInfo = extractElementsAndInteractions(stdout);
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

function createOverallElements() {
    var pValues = ["001", "01", "05", "1"];
    console.log("Creating overall elements");

    for (var i = 0; i < pValues.length; i++) {
        cacheElementsForPValue(pValues[i], "R_Scripts/getWeightsAndDegreesFilterByWeight.R");
        createListOfSelfLoopGenes(pValues[i], "R_Scripts/getSelfLoopGeneNames.R");
    }
}

function initializeServer() {
    createAndStoreCorrelationsAndDegrees(createOverallElements);

    /*async.series([function(callback) {
        createAndStoreCorrelationsAndDegrees();
        callback();
    }, function(callback) {
        createOverallElements();
        callback();
    }], function() {});*/
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
