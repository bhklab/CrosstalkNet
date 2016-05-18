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

    var initialColor = selectedGenes[0].endsWith("-E") ? "red" : "blue";
    numberOfGenes = selectedGenes.length;

    argsArray = [pValue, numberOfGenes];
    argsArray = argsArray.concat(selectedGenes);
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
                sourceNodes.push(nodeUtils.createNodes([selectedGenes[i]], 'par' + i, 0, 0));
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
                edges = edges.concat(edgeUtils.createEdgesFromREdges(parsedEdges[i].value));
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

app.post('/submatrix-new', function(req, res) {
    var argsString = "";
    var argsArray = [];
    var genes = req.body.genes;
    var pValue = req.body.pValue;
    var requestedLayout = req.body.layout;
    var minPositiveWeight = req.body.minPositiveWeight;
    var minNegativeWeight = req.body.minNegativeWeight;
    var filter = req.body.filter;

    if (!(genes instanceof Array)) {
        genes = [genes];
    } else if (genes == null || genes == "" || genes == []) {
        res.json({ error: "Error" });
        return;
    }
    console.log(req.query);

    argsArray = [pValue, minNegativeWeight, minPositiveWeight, filter, genes.length];
    argsArray = argsArray.concat(genes);
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
            var weightsFirst = parsedValue.value[0].value;
            var degreesFirst = parsedValue.value[1].value;

            var weightsSecond = parsedValue.value[2].value;
            var degreesSecond = parsedValue.value[3].value;
            var parsedEdges = parsedValue.value[4].value;

            var sourceNodes = [];
            var firstNodes = {};
            var secondNodes = {};
            var parentNodes = [];
            var edges = [];
            var elements = [];
            var config = null;
            var layout = null;

            for (var i = 0; i < genes.length; i++) {
                sourceNodes.push(nodeUtils.createNodes([genes[i]], 'par' + i, 0, 0));
            }

            console.log("parsed edges:");
            console.log(parsedEdges);

            if (false) {//degreesFirst[0].attributes.names == null) {
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
                firstNodes["" + i] = nodeUtils.createNodes(weightsFirst[i].value, "par" + (i + 1), 0, degreesFirst[i].value);
            }

            for (var i = 0; i < weightsSecond.length; i++) {
                secondNodes["" + i] = nodeUtils.createNodes(weightsSecond[i].value, "par" + (i + 1), 0, degreesSecond[i].value);
            }


            for (var i = 0; i < parsedEdges.length; i++) {
                edges = edges.concat(edgeUtils.createEdgesFromREdges(parsedEdges[i].value));
            }

            elements = elements.concat(edges);
            //elements.push(sourceNodes[0][0]);

            for (var i = 0; i < sourceNodes.length; i++) {
                elements = elements.concat(sourceNodes[i]);
            }

            for (nodeCollection in firstNodes) {

                elements = elements.concat(firstNodes[nodeCollection]);
            }

            for (nodeCollection in secondNodes) {

                elements = elements.concat(secondNodes[nodeCollection]);
            }

            config = configUtils.createConfig();
            layout = configUtils.createRandomLayout();

            configUtils.setConfigElements(config, elements);
            configUtils.setConfigLayout(config, layout);

            res.json({ config: config });
        });
});

app.get('/submatrix', function(req, res) {
    var argsString = "";
    var argsArray = [];
    var genes = req.query.genes;
    var pValue = req.query.pValue;
    var requestedLayout = req.query.layout;
    var minPositiveWeight = req.query.minPositiveWeight;
    var minNegativeWeight = req.query.minNegativeWeight;
    var filter = req.query.filter;

    if (!(genes instanceof Array)) {
        genes = [genes];
    } else if (genes == null || genes == "" || genes == []) {
        res.json({ error: "Error" });
        return;
    }
    console.log(req.query);

    argsArray = [pValue, minNegativeWeight, minPositiveWeight, filter, genes.length];
    argsArray = argsArray.concat(genes);
    argsString = execUtils.createArgsStringFromArray(argsArray);

    var child = exec("Rscript R_Scripts/getRelevantSubmatrix.R --args " + argsString, {
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
                requestedLayout);

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
