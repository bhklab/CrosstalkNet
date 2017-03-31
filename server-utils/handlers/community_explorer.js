var authenticationUtils = require(APP_BASE_DIRECTORY + 'server-utils/authentication_utils');
var communityFileUtils = require(APP_BASE_DIRECTORY + '/server-utils/community_file_utils');
var configUtils = require(APP_BASE_DIRECTORY + '/server-utils/cytoscape/config_utils');
var nodeUtils = require(APP_BASE_DIRECTORY + '/server-utils/cytoscape/node_utils');
var styleUtils = require(APP_BASE_DIRECTORY + '/server-utils/cytoscape/style_utils');
var edgeUtils = require(APP_BASE_DIRECTORY + '/server-utils/cytoscape/edge_utils');
var communityUtils = require(APP_BASE_DIRECTORY + '/server-utils/cytoscape/community_utils');
var layoutUtils = require(APP_BASE_DIRECTORY + '/server-utils/cytoscape/layout_utils');
var geneUtils = require(APP_BASE_DIRECTORY + '/server-utils/gene_utils');
var parseUtils = require(APP_BASE_DIRECTORY + '/server-utils/parse_utils');
var exec = require('child_process').exec;

function handler(req, res) {
    var args = { filePath: null };
    var argsString = "";
    var file;
    var user = authenticationUtils.getUserFromToken(req.body.token);

    console.log(req.body.token);

    file = communityFileUtils.getRequestedFile(req.body.selectedFile, user);

    if (file == null || file.path == null || file.name == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.filePath = file.path + file.name;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    callRScript(argsString, res);
}

module.exports = {
    handler: handler
};

function callRScript(argsString, res) {
    console.log('Calling R script');
    exec("Rscript r_scripts/community_explorer.R --args \"" + argsString + "\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }

        var parsedValue = JSON.parse(stdout);
        var parsedNodes = parsedValue.nodes;
        var parsedEdges = parsedValue.edges;
        var communities = parsedValue.communities;
        var communityNumbers = parsedValue.communityNumbers;

        var nodes = [];
        var edges = [];
        var generatedColors = [];
        var config = configUtils.createConfig();
        var layout;

        for (var i = 0; i < parsedNodes.length; i++) {
            nodes[i] = nodeUtils.createNodesFromRNodes(parsedNodes[i], communityNumbers[i], true);

            var colorClass = communityNumbers[i];
            var randomColor = styleUtils.createRandomColor(generatedColors);
            generatedColors.push(randomColor);

            var epiStyle = styleUtils.createCommunityStyle("epi", colorClass, randomColor, 'circle');
            var stromaStyle = styleUtils.createCommunityStyle("stroma", colorClass, randomColor, 'triangle');

            config = configUtils.addStyleToConfig(config, epiStyle);
            config = configUtils.addStyleToConfig(config, stromaStyle);
            nodes[i] = nodeUtils.addClassToNodes(nodes[i], colorClass);
        }

        nodes = nodes.sort(function(a, b) {
            return a.length - b.length;
        });

        edges = edgeUtils.createCommunityEdgesFromREdges(parsedEdges);

        // Position nodes randomly in clusters
        nodes = communityUtils.positionCommunitiesRandom(nodes, styleUtils.nodeSizes.medium / 2);

        layout = layoutUtils.createPresetLayout();

        //nodes = nodes.concat(nodeUtils.createParentNodesCommunities(communityNumbers));

        config = configUtils.addStyleToConfig(config, styleUtils.noLabel);
        config = configUtils.addStyleToConfig(config, styleUtils.invisibleParent);
        config = configUtils.addStyleToConfig(config, styleUtils.communityEdge);
        config = configUtils.addStyleToConfig(config, styleUtils.communityNode);

        nodes = parseUtils.flatten(nodes);
        edges = parseUtils.flatten(edges);

        config = configUtils.setConfigLayout(config, layout);
        config = configUtils.setConfigElements(config, nodes.concat(edges));

        res.json({
            config: config,
            communities: communities,
            communityNumbers: communityNumbers
        });
    });
}