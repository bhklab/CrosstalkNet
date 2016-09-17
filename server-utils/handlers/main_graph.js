var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var matrixFileUtils = require(APP_BASE_DIRECTORY + 'server-utils/matrix_file_utils');
var styleUtils = require(APP_BASE_DIRECTORY + 'server-utils/cytoscape/style_utils');
var parseUtils = require(APP_BASE_DIRECTORY + 'server-utils/parse_utils');
var validationUtils = require(APP_BASE_DIRECTORY + 'server-utils/validation_utils');
var configUtils = require(APP_BASE_DIRECTORY + 'server-utils/cytoscape/config_utils');
var nodeUtils = require(APP_BASE_DIRECTORY + 'server-utils/cytoscape/node_utils');
var edgeUtils = require(APP_BASE_DIRECTORY + 'server-utils/cytoscape/edge_utils');
var layoutUtils = require(APP_BASE_DIRECTORY + 'server-utils/cytoscape/layout_utils');
var clientTableUtils = require(APP_BASE_DIRECTORY + 'server-utils/client_table_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var args = {};
    var argsString = "";
    var files = null;
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var requestedLayout = req.body.layout;
    var filterValidationRes = validationUtils.validateFilters(req.body);
    var user = authenticationUtils.getUserFromToken(req.body.token);

    files = matrixFileUtils.getRequestedFiles(req.body.selectedFile, req.body.selectedNetworkType, user);

    if (filterValidationRes.error) {
        res.send(filterValidationRes);
        return;
    }

    var fileValidationres = validationUtils.validateFiles(files);
    if (fileValidationres.error) {
        res.send({ error: fileValidationres.error });
        return;
    }

    selectedGeneNames = validationUtils.validateSelectedGenes(selectedGenes);
    if (selectedGeneNames.error) {
        res.send({ error: selectedGeneNames.error });
        return;
    }

    args.selectedNetworkType = req.body.selectedNetworkType;
    args.fileNameMatrixNormal = files.normal;
    args.fileNameMatrixTumor = files.tumor;
    args.fileNameMatrixDelta = files.delta;
    args.fileNameDegrees = files.degree;
    args.minPositiveWeightFirst = req.body.minPositiveWeightFirst;
    args.minNegativeWeightFirst = req.body.minNegativeWeightFirst;
    args.minPositiveWeightSecond = req.body.minPositiveWeightSecond;
    args.minNegativeWeightSecond = req.body.minNegativeWeightSecond;
    args.weightFilterFirst = req.body.filterFirst;
    args.weightFilterSecond = req.body.filterSecond;
    args.depth = req.body.depth;

    args.genesOfInterest = selectedGeneNames;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res, selectedGenes, requestedLayout);
}

function callRScript(argsString, res, selectedGenes, requestedLayout) {
    exec("Rscript r_scripts/main_graph.R --args \"" + argsString + "\"", {
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

            var parsedNodesFirst = parsedValue.neighboursNodes.first;
            var parsedNodesSecond = parsedValue.neighboursNodes.second;

            var parsedEdgesFirst = parsedValue.edges.first;
            var parsedEdgesSecond = parsedValue.edges.second;
            var parsedEdgesAll = parsedEdgesFirst.concat(parsedEdgesSecond);

            var sourceNodes = [];
            var firstNodes = [];
            var secondNodes = [];
            var parentNodes = [];
            var allNodes = [];
            var edges = [];
            var cytoscapeEdges = [];
            var firstNeighbourInteractions = [];
            var secondNeighbourInteractions = [];
            var edgeDictionary = {};
            var selfLoops = [];
            var elements = [];
            var config = null;
            var layout = null;
            var edgeStyleNegative = JSON.parse(JSON.stringify(styleUtils.edgeWeights.negative));
            var edgeStylePositive = JSON.parse(JSON.stringify(styleUtils.edgeWeights.positive));

            var overallWeights = parseUtils.parseMinMaxWeights(parsedValue.minMaxWeightOverall);
            var depthWeights = parseUtils.parseMinMaxWeights(parsedValue.minMaxWeightDepth);

            edgeStyleNegative = styleUtils.setDynamicEdgeStyles(edgeStyleNegative, { min: overallWeights.minNegative, max: overallWeights.maxNegative });
            edgeStylePositive = styleUtils.setDynamicEdgeStyles(edgeStylePositive, { min: overallWeights.minPositive, max: overallWeights.maxPositive });

            sourceNodes = createSourceNodes(selectedGenes);
            firstNodes = parseNodes(parsedNodesFirst);
            secondNodes = parseNodes(parsedNodesSecond);

            firstNeighbourInteractions = parseEdges(parsedEdgesFirst, 1);
            secondNeighbourInteractions = parseEdges(parsedEdgesSecond, 2);

            edges = edges.concat(firstNeighbourInteractions);
            edges = edges.concat(secondNeighbourInteractions);

            elements = elements.concat(edges);
            config = configUtils.createConfig();

            if (requestedLayout == 'bipartite' || requestedLayout == 'preset') {
                config = createBipartiteLayout(firstNodes, secondNodes, sourceNodes, edges);
            } else if (requestedLayout == 'clustered') {
                config = createConcentricLayout(firstNodes, secondNodes, sourceNodes, edges);
            } else {
                config = createRandomLayout(firstNodes, secondNodes, sourceNodes, edges);
            }

            config = configUtils.addStyleToConfig(config, edgeStyleNegative);
            config = configUtils.addStyleToConfig(config, edgeStylePositive);

            edgeDictionary = clientTableUtils.createEdgeDictionaryFromREdges([].concat.apply([], parsedEdgesAll));
            selfLoops = clientTableUtils.getSelfLoops(edges);

            res.json({
                config: config,
                minNegativeWeight: depthWeights.minNegative,
                maxPositiveWeight: depthWeights.maxPositive,
                firstNeighbours: firstNodes,
                secondNeighbours: secondNodes,
                edgeDictionary: edgeDictionary,
                selfLoops: selfLoops
            });
        });
}

function createSourceNodes(selectedGenes) {
    var sourceNodes = [];

    for (var i = 0; i < selectedGenes.length; i++) {
        sourceNodes.push(nodeUtils.createNodes([selectedGenes[i].object.name], 'par' + 0, selectedGenes[i].object.degree, -1));
    }

    return sourceNodes;
}

function parseNodes(RNodes) {
    var nodes = [];

    for (var i = 0; i < RNodes.length; i++) {
        nodes.push(nodeUtils.createNodesFromRNodes(RNodes[i], "par", false));
    }

    return nodes;
}

function parseEdges(REdges, level) {
    var edges = [];

    for (var i = 0; i < REdges.length; i++) {
        edges = edges.concat(edgeUtils.createEdgesFromREdges(REdges[i], level));
    }

    return edges;
}

function createBipartiteLayout(firstNodes, secondNodes, sourceNodes, edges) {
    var allNodes = [];
    var config = configUtils.createConfig();
    var elements = [];
    var layout;
    var parentNodes = [];
    var maxRows = 1;
    var maxCols = 3;

    allNodes = [parseUtils.flatten(sourceNodes)].concat([parseUtils.flatten(firstNodes)]).concat([parseUtils.flatten(secondNodes)]);

    for (var j = 0; j < allNodes.length; j++) {
        if (allNodes[j].length > maxRows) {
            maxRows = allNodes[j].length;
        }
    }

    allNodes = nodeUtils.positionNodesBipartiteGrid(allNodes);
    layout = layoutUtils.createGridLayout(maxRows, maxCols);

    parentNodes = nodeUtils.createParentNodesMG("par", sourceNodes, firstNodes, secondNodes);
    allNodes.push(parentNodes);
    allNodes = parseUtils.flatten(allNodes);

    elements = allNodes.concat(edges);

    config = configUtils.addStylesToConfig(config, styleUtils.getAllBipartiteStyles());
    config = configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
    config = configUtils.setConfigLayout(config, layout);
    config = configUtils.setConfigElements(config, edges.concat(allNodes));

    return config;
}

function createConcentricLayout(firstNodes, secondNodes, sourceNodes, edges) {
    var allNodes = [];
    var config = configUtils.createConfig();
    var elements = [];
    var layout;
    var largestClusterSize = 0;

    sourceNodes = nodeUtils.addClassToNodes(parseUtils.flatten(sourceNodes), "sourceNode");

    for (var i = 0; i < sourceNodes.length; i++) {
        var clusterSize = nodeUtils.getMinRadius(firstNodes[i] == null ? 0 : firstNodes[i].length, styleUtils.nodeSizes.medium / 2, 3, 120) + nodeUtils.getMinRadius(secondNodes[i] == null ? 0 : secondNodes[i].length, styleUtils.nodeSizes.medium / 2, 3, 120);

        if (clusterSize > largestClusterSize) {
            largestClusterSize = clusterSize;
        }
    }

    var clusteredResult;

    for (var i = 0; i < sourceNodes.length; i++) {
        clusteredResult = nodeUtils.positionNodesClustered(sourceNodes[i], firstNodes[i] == null ? [] : firstNodes[i], secondNodes[i] == null ? [] : secondNodes[i], i, sourceNodes.length, styleUtils.nodeSizes.medium / 2, largestClusterSize, 3);

        if (firstNodes[i] != null) {
            firstNodes[i] = clusteredResult.firstNeighbours;
        }

        if (secondNodes[i] != null) {
            secondNodes[i] = clusteredResult.secondNeighbours;
        }

        sourceNodes[i] = clusteredResult.selectedGene;
    }

    layout = layoutUtils.createPresetLayout();
    config = configUtils.addStylesToConfig(config, styleUtils.allConcentricFormats);

    allNodes = sourceNodes.concat(firstNodes).concat(secondNodes);
    allNodes = parseUtils.flatten(allNodes);

    elements = allNodes.concat(edges);

    config = configUtils.setConfigLayout(config, layout);
    config = configUtils.setConfigElements(config, edges.concat(allNodes));

    return config;
}

function createRandomLayout(firstNodes, secondNodes, sourceNodes, edges) {
    var allNodes = [];
    var config = configUtils.createConfig();
    var elements = [];
    var layout;

    sourceNodes = nodeUtils.addClassToNodes(parseUtils.flatten(sourceNodes), "sourceNode");
    allNodes = sourceNodes.concat(firstNodes).concat(secondNodes);
    allNodes = parseUtils.flatten(allNodes);

    layout = layoutUtils.createRandomLayout(allNodes.length, styleUtils.nodeSizes.medium);

    config = configUtils.addStylesToConfig(config, styleUtils.allRandomFormats);
    config = configUtils.setConfigLayout(config, layout);
    config = configUtils.setConfigElements(config, edges.concat(allNodes));

    return config;
}

module.exports = {
    handler: handler
};