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
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var requestedLayout = req.body.layout;
    var genesArg = "";
    var files = null;
    var user = authenticationUtils.getUserFromToken(req.body.token);

    files = matrixFileUtils.getRequestedFiles(req.body.selectedFile, req.body.selectedNetworkType, user);

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
    args.selectedGenes = selectedGeneNames;
    args.fileNameMatrixNormal = files.normal;
    args.fileNameMatrixTumor = files.tumor;
    args.fileNameMatrixDelta = files.delta;
    args.fileNameDegrees = files.degree;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res, selectedGenes, requestedLayout);
}

function callRScript(argsString, res, selectedGenes, requestedLayout) {
    exec("Rscript r_scripts/interaction_explorer.R --args \"" + argsString + "\"", { maxBuffer: 1024 * 50000 },
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

            var RNodes = parsedValue.nodes
            var REdges = parsedValue.edges;

            var colPost = parsedValue.colPost;
            var rowPost = parsedValue.rowPost;

            var interactionsTableList = [];
            var sourceNodes = [];
            var nodes = [];
            var edges = [];
            var edgeDictionary = {};
            var edgeStyleNegative = JSON.parse(JSON.stringify(styleUtils.edgeWeights.negative));
            var edgeStylePositive = JSON.parse(JSON.stringify(styleUtils.edgeWeights.positive));

            var overallWeights = parseUtils.parseMinMaxWeights(parsedValue.minMaxWeightOverall);
            edgeStyleNegative = styleUtils.setDynamicEdgeStyles(edgeStyleNegative, { min: overallWeights.minNegative, max: overallWeights.maxNegative });
            edgeStylePositive = styleUtils.setDynamicEdgeStyles(edgeStylePositive, { min: overallWeights.minPositive, max: overallWeights.maxPositive });

            sourceNodes.push(nodeUtils.createNodes([selectedGenes[0].value], 'par' + 0, selectedGenes[0].object.degree, -1, rowPost));

            edges = parseEdges(REdges);
            nodes = parseNodes(RNodes, rowPost);

            if (requestedLayout == 'bipartite' || requestedLayout == 'preset') {
                config = createBipartiteLayout(nodes, sourceNodes, edges, selectedGenes);
            } else {
                config = createRandomLayout(nodes, sourceNodes, edges);
            }

            config = configUtils.addStyleToConfig(config, edgeStyleNegative);
            config = configUtils.addStyleToConfig(config, edgeStylePositive);

            selfLoops = clientTableUtils.getSelfLoops(edges);
            edgeDictionary = clientTableUtils.createEdgeDictionaryFromREdges([].concat.apply([], REdges));

            res.json({
                config: config,
                selfLoops: selfLoops,
                edgeDictionary: edgeDictionary
            });
        });
}

function parseEdges(REdges) {
    var edges = [];

    for (var i = 0; i < REdges.length; i++) {
        edges = edges.concat(edgeUtils.createEdgesFromREdges(REdges[i], i + 1));
    }

    return edges;
}

function parseNodes(RNodes, rowPost) {
    var nodes = [];

    for (var i = 0; i < RNodes.length; i++) {
        nodes.push(nodeUtils.createNodesFromRNodes(RNodes[i], "par", false, rowPost));
    }

    return nodes;
}

function createBipartiteLayout(nodes, sourceNodes, edges, selectedGenes) {
    var maxRows = 1;
    var maxCols = 1;
    var config = configUtils.createConfig();
    var layout;
    var allNodes = [];
    var elements = [];

    allNodes = nodes.concat(sourceNodes);

    maxCols = allNodes.length + 1;
    allNodes = nodeUtils.positionNodesBipartiteGrid(allNodes);

    for (var j = 0; j < allNodes.length; j++) {
        if (allNodes[j].length > maxRows) {
            maxRows = allNodes[j].length;
        }
    }

    layout = layoutUtils.createGridLayout(maxRows, maxCols);

    config = configUtils.addStylesToConfig(config, styleUtils.getAllBipartiteStyles());
    config = configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
    config = configUtils.setConfigLayout(config, layout);

    parentNodes = nodeUtils.createParentNodesIE(selectedGenes, nodes);
    elements = elements.concat(parentNodes);
    elements = elements.concat([].concat.apply([], allNodes));
    elements = elements.concat(edges);

    config = configUtils.setConfigElements(config, elements);

    return config;
}

function createRandomLayout(nodes, sourceNodes, edges) {
    var allNodes;
    var config = configUtils.createConfig();
    var elements = [];
    var layout;

    for (var i = 0; i < nodes.length; i++) {
        for (var j = 0; j < nodes[i].length; j++) {
            if (nodes[i][j].data.isSource) {
                nodes[i][j] = nodeUtils.addClassToNodes(nodes[i][j], "sourceNode");
            }
        }
    }

    config = configUtils.createConfig();
    layout = layoutUtils.createRandomLayout([].concat.apply([], nodes).length, styleUtils.nodeSizes.medium);

    sourceNodes = nodeUtils.addClassToNodes(sourceNodes[0], "sourceNode");
    config = configUtils.addStylesToConfig(config, styleUtils.allRandomFormats);
    config = configUtils.setConfigLayout(config, layout);

    allNodes = nodes.concat(sourceNodes);

    elements = elements.concat([].concat.apply([], allNodes));
    elements = elements.concat(edges);

    config = configUtils.setConfigElements(config, elements);

    return config;
}

module.exports = {
    handler: handler
};
