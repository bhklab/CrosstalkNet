const fs = require('fs');
//var opencpu = require('opencpu');
var exec = require('child_process').exec;
var child_process = require('child_process');
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
var layoutUtils = require('layoutUtils');
var authenticationUtils = require('authenticationUtils');
var validationUtils = require('validationUtils');
var clientTableUtils = require('clientTableUtils');
var parseUtils = require('parseUtils');
var multiparty = require('connect-multiparty');
var jwt = require('jsonwebtoken');
var mongoose = require('mongoose');
var User = require('user');
var databaseConfigUtils = require('databaseConfigUtils');
var bcrypt = require('bcrypt');

mongoose.connect(databaseConfigUtils.database);

var availableMatrices = {};

app.set('superSecret', databaseConfigUtils.secret);
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


//app.use(express.static('app'));

// app.all('*', function(req, res) {
//     res.redirect({ error: "Please send a valid query." });
// });

app.use(function(req, res, next) {
    console.log(req.body);
    if (req.body.token == null) {
        if (req.body.user == null) {
            res.send({ error: "Failed to authenticate." });
        } else {
            User.findOne({
                name: req.body.user.name
            }, function(err, user) {

                if (err) throw err;

                if (!user) {
                    res.json({ success: false, message: 'Authentication failed. User not found.' });
                } else if (user) {

                    // check if password matches
                    if (!bcrypt.compareSync(req.body.user.password, user.password)) {
                        res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                    } else {

                        // if user is found and password is right
                        // create a token
                        var token = jwt.sign(user, app.get('superSecret'), {
                            expiresIn: '2000000h' // expires in 24 hours
                        });

                        // return the information including token as JSON
                        res.json({
                            success: true,
                            message: 'Enjoy your token!',
                            token: token
                        });
                    }

                }

            });

            // if (authenticationUtils.passwords.indexOf(req.body.password) >= 0) {
            //     var token = jwt.sign({ foo: 'bar' }, app.get('secret'), {
            //         expiresIn: '0' // expires in 24 hours
            //     });

            //     // return the information including token as JSON
            //     res.json({
            //         success: true,
            //         message: 'Enjoy your token!',
            //         token: token
            //     });
            // }
        }
    } else {
        jwt.verify(req.body.token, app.get('superSecret'), function(err, decoded) {
            if (err) {
                console.log(err);
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });
    }
});

app.post('/gene-list', function(req, res) {
    var args = { pValue: null, fileName: null };
    var argsString = "";
    var fileName = req.body.fileName;
    var file = matchSelectedFile(fileName);

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.pValue = file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;
    var geneList = [];

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/getGeneList.R --args \"" + argsString + "\"", {
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

            var epiDegrees = parsedValue.epiDegrees;
            var stromaDegrees = parsedValue.stromaDegrees;

            var epiGeneNames = parsedValue.epiDegreesNames;
            var stromaGeneNames = parsedValue.stromaDegreesNames;

            allGenes = allGenes.concat(geneUtils.createGeneList(epiGeneNames, epiDegrees));
            allGenes = allGenes.concat(geneUtils.createGeneList(stromaGeneNames, stromaDegrees));

            geneList = allGenes.map(function(gene) {
                return {
                    value: gene.name,
                    display: gene.name + ' ' + gene.degree,
                    object: gene
                };
            });

            res.send({ geneList: geneList });
        });
});

app.post('/neighbour-general', function(req, res) {
    var args = {};
    var fileName = req.body.fileName;
    var file = matchSelectedFile(fileName);
    var argsString = "";
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var requestedLayout = req.body.layout;
    var genesArg = "";

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.pValue = file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;

    if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Please select a gene." });
        return;
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    args.selectedGenes = selectedGeneNames;

    var initialColor = selectedGenes[0].value.endsWith("-E") ? "red" : "blue";

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_scripts/neighbourExplorer.R --args \"" + argsString + "\"", { maxBuffer: 1024 * 50000 },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            var parsedNodes = parsedValue.nodes
            var parsedEdges = parsedValue.edges;

            var interactionsTableList = [];
            var sourceNodes = [];
            var nodes = [];
            var parentNodes = [];
            var edges = [];
            var elements = [];
            var config = null;
            var layout = null;
            var edgeDictionary = {};
            var edgeStyleNegative = JSON.parse(JSON.stringify(styleUtils.edgeWeights.negative));
            var edgeStylePositive = JSON.parse(JSON.stringify(styleUtils.edgeWeights.positive));

            var overallWeights = parseUtils.parseMinMaxWeights(parsedValue.minMaxWeightOverall);
            styleUtils.setDynamicEdgeStyles(edgeStyleNegative, edgeStylePositive, overallWeights);

            sourceNodes.push(nodeUtils.createNodes([selectedGenes[0].value], 'par' + 0, 0, selectedGenes[0].object.degree, -1));

            if (parsedNodes.length == null) {
                nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                    100, 0, 0);
                nodeUtils.addStyleToNodes(sourceNodes[0], 10, 10,
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

            for (var i = 0; i < parsedEdges.length; i++) {
                edges = edges.concat(edgeUtils.createEdgesFromREdgesFinal(parsedEdges[i], i + 1));
                //interactionsTableList.push()
            }

            for (var i = 0; i < parsedNodes.length; i++) {
                nodes.push(nodeUtils.createNodesFromRNodes(parsedNodes[i], true));
            }

            if (requestedLayout == 'bipartite' || requestedLayout == 'preset') {
                nodeUtils.addPositionsToNodes(sourceNodes[0], 100,
                    100, 0, 0);

                nodeUtils.addClassToNodes(sourceNodes[0], "sourceNode");

                for (var i = 0; i < selectedGenes.length + 1; i++) {
                    if (i < 1) {
                        parentNodes.push({
                            data: {
                                id: "par" + i
                            }
                        });
                    } else if (nodes[i - 1].length > 0) {
                        parentNodes.push({
                            data: {
                                id: "par" + i
                            }
                        });
                    }
                }

                var yIncrement = 0;

                for (var j = 0; j < nodes.length; j++) {
                    nodeUtils.addPositionsToNodes(nodes[j], 400 * (j + 1), 100, 0, 30);
                }

                elements = elements.concat(parentNodes);

                layout = layoutUtils.createPresetLayout();
                config = configUtils.createConfig();

                for (prop in styleUtils.bipartiteStyles.epi) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi[prop]);
                }

                for (prop in styleUtils.bipartiteStyles.stroma) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma[prop]);
                }

                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.labelPlacement);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.labelPlacement);
            } else {
                for (var i = 0; i < nodes.length; i++) {
                    for (var j = 0; j < nodes[i].length; j++) {
                        if (nodes[i][j].data.isSource) {
                            nodeUtils.addClassToNodes(nodes[i][j], "sourceNode");
                        }
                    }
                }

                config = configUtils.createConfig();
                layout = layoutUtils.createRandomLayout([].concat.apply([], nodes).length, styleUtils.nodeSizes.medium);

                nodeUtils.addClassToNodes(sourceNodes[0], "sourceNode");
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceEpi);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceStroma);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.labelBackground);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.labelPlacement);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.labelPlacement);
            }

            elements = elements.concat([].concat.apply([], nodes));
            elements = elements.concat(edges);
            elements.push(sourceNodes[0][0]);

            configUtils.addStyleToConfig(config, edgeStyleNegative);
            configUtils.addStyleToConfig(config, edgeStylePositive);
            configUtils.setConfigElements(config, elements);
            configUtils.setConfigLayout(config, layout);

            selfLoops = clientTableUtils.getSelfLoops(edges);
            edgeDictionary = clientTableUtils.createEdgeDictionary(edges);

            res.json({
                config: config,
                selfLoops: selfLoops,
                edgeDictionary: edgeDictionary
            });
        });
});

app.post('/submatrix', function(req, res) {
    var args = {};
    var argsString = "";
    var argsArray = [];
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var fileName = req.body.fileName;
    var file = matchSelectedFile(fileName);
    var requestedLayout = req.body.layout;

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    var filterValidationRes = validationUtils.validateFilters(req.body);
    if (filterValidationRes.error) {
        res.send(filterValidationRes);
        return;
    }

    args.pValue = file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;
    args.minPositiveWeightFirst = req.body.minPositiveWeightFirst;
    args.minNegativeWeightFirst = req.body.minNegativeWeightFirst;
    args.minPositiveWeightSecond = req.body.minPositiveWeightSecond;
    args.minNegativeWeightSecond = req.body.minNegativeWeightSecond;
    args.weightFilterFirst = req.body.filterFirst;
    args.weightFilterSecond = req.body.filterSecond;
    args.depth = req.body.depth;

    if (!(selectedGenes instanceof Array)) {
        selectedGenes = [selectedGenes];
    } else if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Please select at least 1 gene of interest." });
        return;
    }

    console.log(req.body);

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    args.genesOfInterest = selectedGeneNames;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/submatrix.R --args \"" + argsString + "\"", {
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
            //console.log(parsedValue);

            var parsedNodesFirst = parsedValue.neighboursNodes.first;
            var parsedNodesSecond = parsedValue.neighboursNodes.second;

            var parsedEdgesFirst = parsedValue.edges.first;
            var parsedEdgesSecond = parsedValue.edges.second;

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

            styleUtils.setDynamicEdgeStyles(edgeStyleNegative, edgeStylePositive, overallWeights);

            for (var i = 0; i < selectedGenes.length; i++) {
                sourceNodes.push(nodeUtils.createNodes([selectedGenes[i].object.name], null, 0, selectedGenes[i].object.degree, -1)[0]);
                allNodes.push(sourceNodes[i]);
            }

            for (var i = 0; i < parsedNodesFirst.length; i++) {
                firstNodes[i] = nodeUtils.createNodesFromRNodes(parsedNodesFirst[i], false);
                allNodes = allNodes.concat(firstNodes[i]);
            }

            for (var i = 0; i < parsedNodesSecond.length; i++) {
                secondNodes[i] = nodeUtils.createNodesFromRNodes(parsedNodesSecond[i], false);
                allNodes = allNodes.concat(secondNodes[i]);
            }

            for (var i = 0; i < parsedEdgesFirst.length; i++) {
                cytoscapeEdges = cytoscapeEdges.concat(edgeUtils.createEdgesFromREdgesFinal(parsedEdgesFirst[i], 1));
            }

            firstNeighbourInteractions = cytoscapeEdges;
            cytoscapeEdges = [];

            for (var i = 0; i < parsedEdgesSecond.length; i++) {
                cytoscapeEdges = cytoscapeEdges.concat(edgeUtils.createEdgesFromREdgesFinal(parsedEdgesSecond[i], 2));
            }

            secondNeighbourInteractions = cytoscapeEdges;

            console.log("Length of all nodes: " + allNodes.length);
            console.log("Length of all edges: " + (firstNeighbourInteractions.length + secondNeighbourInteractions.length));

            edges = edges.concat(firstNeighbourInteractions);
            edges = edges.concat(secondNeighbourInteractions);

            elements = elements.concat(edges);
            config = configUtils.createConfig();

            if (requestedLayout == 'bipartite' || requestedLayout == 'preset') {
                allNodes.push({
                    data: { id: "epi" }
                });
                allNodes.push({
                    data: { id: "stroma" }
                });
                layoutUtils.positionNodesBipartite(allNodes, 100, 300, 100, 100);
                layout = layoutUtils.createPresetLayout();

                for (prop in styleUtils.bipartiteStyles.epi) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi[prop]);
                }

                for (prop in styleUtils.bipartiteStyles.stroma) {
                    configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma[prop]);
                }

                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium)
            } else if (requestedLayout == 'clustered') {
                var largestClusterSize = 0;
                nodeUtils.addClassToNodes(sourceNodes, "sourceNode");

                for (var i = 0; i < sourceNodes.length; i++) {
                    var clusterSize = layoutUtils.getMinRadius(firstNodes[i] == null ? 0 : firstNodes[i].length, styleUtils.nodeSizes.medium / 2) + layoutUtils.getMinRadius(secondNodes[i] == null ? 0 : secondNodes[i].length, styleUtils.nodeSizes.medium / 2);

                    if (clusterSize > largestClusterSize) {
                        largestClusterSize = clusterSize;
                    }
                }

                for (var i = 0; i < sourceNodes.length; i++) {
                    layoutUtils.positionNodesClustered(sourceNodes[i], firstNodes[i] == null ? [] : firstNodes[i], secondNodes[i] == null ? [] : secondNodes[i], i, sourceNodes.length, styleUtils.nodeSizes.medium / 2, largestClusterSize);
                }

                layout = layoutUtils.createPresetLayout();
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.source);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.labelPlacement);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.labelPlacement);
            } else {
                layout = layoutUtils.createRandomLayout(allNodes.length, styleUtils.nodeSizes.medium);
                nodeUtils.addClassToNodes(sourceNodes, "sourceNode");
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceEpi);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.stripedSourceStroma);
                configUtils.addStyleToConfig(config, styleUtils.randomStyles.labelBackground);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.nodeColor);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.epi.labelPlacement);
                configUtils.addStyleToConfig(config, styleUtils.bipartiteStyles.stroma.labelPlacement);
            }

            configUtils.addStyleToConfig(config, edgeStyleNegative);
            configUtils.addStyleToConfig(config, edgeStylePositive);
            configUtils.setConfigElements(config, edges.concat(allNodes));
            configUtils.setConfigLayout(config, layout);
            edgeDictionary = clientTableUtils.createEdgeDictionary(edges);
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
});

app.post('/get-all-paths', function(req, res) {
    var args = {};
    var argsString = "";
    var argsArray = [];
    var fileName = req.body.fileName;
    var file = matchSelectedFile(fileName);
    var source = req.body.source;
    var target = req.body.target;

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.source = source;
    args.target = target;
    args.fileName = file.fileName;
    args.path = file.path;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/getAllPaths.R --args \"" + argsString + "\"", {
        maxBuffer: 1024 *
            50000
    }, function(error, stdout, stderr) {
        if (error != null) {
            console.log('error: ' + error);
        }

        if (stderr != null) {
            console.log(stderr);
        }

        var parsedValue = JSON.parse(stdout);
        var paths = parsedValue.paths;

        res.send({ paths: paths });
    });

});

app.post('/upload-matrix', multiparty({ maxFieldsSize: 15 * 1024 * 1024 }), function(req, res) {
    var file = req.files.file;
    var data = req.body.data;
    console.log(file.name);
    console.log(file.type);

    data = data.replace(/^data:;base64,/, "");

    fs.writeFile('R_Scripts/User_Matrices/' + file.name, data, 'base64', (err) => {
        if (err) throw err;
        checkFileIntegrity(req, res, file);
    });
});

app.post('/available-matrices', function(req, res) {
    var result = getAvailableMatrices();
    var fileNames = [];

    availableMatrices = result;
    fileNames = availableMatrices.map(function(file) {
        return file.fileName
    });

    res.send({ fileList: fileNames });
});

app.post('/overall-matrix-stats', function(req, res) {
    var args = {};
    var fileName = req.body.fileName;
    var file = matchSelectedFile(fileName);

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    args.fileName = file.fileName;
    args.path = file.path;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/getOverallMatrixStats.R  --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            //console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var overallMatrixStats = {};
            var parsedValue = JSON.parse(stdout);

            overallMatrixStats.selfLoops = parsedValue.selfLoops;
            overallMatrixStats.significantInteractions = parsedValue.significantInteractions;
            res.send({ overallMatrixStats: overallMatrixStats });
        });
});

function getAvailableMatrices() {
    var fileNames = [];
    var fileList = [];
    var result = [];

    fileNames = fs.readdirSync('R_Scripts/Full_Matrices');
    fileList = fileNames.map(function(file) {
        return {
            fileName: file,
            pValue: file.split(".").length > 2 ? file.split(".")[1] : "",
            path: "Full_Matrices/"
        };
    });

    fileNames = fs.readdirSync('R_Scripts/User_Matrices');

    fileList = fileList.concat(fileNames.map(function(file) {
        return {
            fileName: file,
            pValue: "", //file.split(".").length > 2 ? file.split(".")[1] : "",
            path: "User_Matrices/"
        };
    }));

    for (var i = 0; i < fileList.length; i++) {
        if (fileList[i].fileName.indexOf('degree') < 0) {
            result.push(fileList[i]);
        }
    }

    return result;
}

function checkFileIntegrity(req, res, file) {
    var child = exec("Rscript R_Scripts/fileChecker.R --args " + file.name, function(error, stdout, stderr) {
        console.log('stderr: ' + stderr);

        if (error != null) {
            console.log('error: ' + error);
        }
        console.log(stdout);

        var parsedValue = JSON.parse(stdout);
        var status = parsedValue.status;
        var message = parsedValue.message;
        var fileList = getAvailableMatrices();

        res.send({ fileStatus: message, fileList: fileList, errorStatus: status });
    });
}

function matchSelectedFile(fileName) {
    for (var i = 0; i < availableMatrices.length; i++) {
        if (availableMatrices[i].fileName == fileName) {
            return availableMatrices[i];
        }
    }

    return null;
}

function initializeAvaialbleMatrices() {
    var result = getAvailableMatrices();

    availableMatrices = result;
}

function createSampleUser() {
    var salt = bcrypt.genSaltSync(3);
    var password = bcrypt.hashSync('8Y$yz2+XG9%9TtM<', salt);
    var nick = new User({
        name: 'Benjamin',
        password: password,
        admin: true
    });

    // save the sample user
    nick.save(function(err) {
        if (err) throw err;

        console.log('User saved successfully');
        // res.json({ success: true });
    });
}

app.listen(5000, function() {
    console.log("Listening on port 5000");
    console.log("Initializing data and config");

    initializeAvaialbleMatrices();
    //createSampleUser();
});
