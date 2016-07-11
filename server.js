const fs = require('fs');
var exec = require('child_process').exec;
var child_process = require('child_process');
var async = require('async');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser')
var app = express();
var nodeUtils = require('./server-utils/nodeUtils');
var configUtils = require('./server-utils/configUtils');
var edgeUtils = require('./server-utils/edgeUtils');
var styleUtils = require('./server-utils/styleUtils');
var geneUtils = require('./server-utils/geneUtils');
var layoutUtils = require('./server-utils/layoutUtils');
var authenticationUtils = require('./server-utils/authenticationUtils');
var validationUtils = require('./server-utils/validationUtils');
var clientTableUtils = require('./server-utils/clientTableUtils');
var parseUtils = require('./server-utils/parseUtils');
var multiparty = require('connect-multiparty');
var jwt = require('jsonwebtoken');
var databaseConfigUtils = require('./server-utils/databaseConfigUtils');
var fileUtils = require('./server-utils/fileUtils');
var bcrypt = require('bcrypt');
var jsonfile = require('jsonfile');
var mkdirp = require('mkdirp');

var availableMatrices = {};

app.get('', function(req, res) {
    res.redirect('/app');
});

app.use('/app', express.static(__dirname + '/app'));
app.set('secretKey', databaseConfigUtils.secret);
app.use(cors());
app.use(bodyParser.json({ limit: '50mb', strict: false }));

app.use(function(req, res, next) {
    if (req.body.token == null) {
        if (req.body.user == null) {
            res.send({ error: "Failed to authenticate." });
        } else {
            authenticationUtils.getUser(req.body.user.name,
                function(user) {
                    if (!user) {
                        res.json({ success: false, message: 'Authentication failed. User not found.' });
                    } else if (user) {
                        if (!bcrypt.compareSync(req.body.user.password, user.password)) {
                            res.json({ success: false, message: 'Authentication failed. Wrong password.' });
                        } else {
                            var token = jwt.sign({ user: user.name + user.password }, app.get('secretKey'), {
                                expiresIn: '168h' // expires in 7 days
                            });

                            authenticationUtils.addTokenToUser(user, token);

                            res.json({
                                success: true,
                                message: 'Enjoy your token!',
                                token: token
                            });
                        }

                    }

                });
        }
    } else if (req.body.token == 'guest') {
        req.accessLevel = 0;
        next();
    } else {
        jwt.verify(req.body.token, app.get('secretKey'), function(err, decoded) {
            if (err) {
                console.log(err);
                return res.json({ success: false, message: 'Failed to authenticate token.' });
            } else {
                var user = authenticationUtils.getUserFromToken(req.body.token);

                if (user) {
                    req.accessLevel = user.accessLevel;
                } else {
                    req.accessLevel = 0;
                }
                next();
            }
        });
    }
});

app.post('/login', function(req, res) {
    res.json({
        success: true,
        message: 'Token Validated!'
    });
});

app.post('/gene-list', function(req, res) {
    var args = { pValue: null, fileName: null };
    var argsString = "";
    var file;

    if (req.body.fileName.delta != null) {
        file = fileUtils.matchSelectedFile(req.body.fileName.delta, availableMatrices, req.accessLevel);
    } else if (req.body.fileName.normal != null) {
        file = fileUtils.matchSelectedFile(req.body.fileName.normal, availableMatrices, req.accessLevel);
    } else if (req.body.fileName.tumor != null) {
        file = fileUtils.matchSelectedFile(req.body.fileName.tumor, availableMatrices, req.accessLevel);
    }

    if (file == null || file.path == null || file.fileName == null) {
        res.send({ error: "Please specify a file name" });
        return;
    }

    var geneList = [];

    args.pValue = file.pValue;
    args.fileName = file.fileName;
    args.path = file.path;

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

app.post('/delta-interaction-explorer', function(req, res) {
    var args = {};
    var argsString = "";
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var requestedLayout = req.body.layout;
    var genesArg = "";
    var files = null;

    files = fileUtils.getRequestedFiles(req, availableMatrices, true);

    if (files == null) {
        res.send({ error: "Please specify the necessary files." });
        return;
    } else if (files.error != null) {
        res.send({ error: files.error });
        return;
    }

    if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Please select a gene." });
        return;
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
    }

    args.selectedNetworkType = req.body.selectedNetworkType;
    args.selectedGenes = selectedGeneNames;
    args.fileNameMatrixNormal = files.normal;
    args.fileNameMatrixTumor = files.tumor;
    args.fileNameMatrixDelta = files.delta;
    args.fileNameDegrees = files.degree;
    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_scripts/deltaNeighbourExplorer.R --args \"" + argsString + "\"", { maxBuffer: 1024 * 50000 },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var initialColor = selectedGenes[0].value.endsWith("-E") ? "red" : "blue";

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

            for (var i = 0; i < parsedEdges.length; i++) {
                edges = edges.concat(edgeUtils.createEdgesFromREdges(parsedEdges[i], i + 1));
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

                for (var j = 0; j < nodes.length; j++) {
                    nodeUtils.addPositionsToNodes(nodes[j], 400 * (j + 1), 100, 0, 30);
                }

                elements = elements.concat(parentNodes);

                layout = layoutUtils.createPresetLayout();
                config = configUtils.createConfig();

                configUtils.addStylesToConfig(config, styleUtils.getAllBipartiteStyles());
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium);
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
                configUtils.addStylesToConfig(config, styleUtils.allRandomFormats);
            }

            elements = elements.concat([].concat.apply([], nodes));
            elements = elements.concat(edges);
            elements.push(sourceNodes[0][0]);

            configUtils.addStyleToConfig(config, edgeStyleNegative);
            configUtils.addStyleToConfig(config, edgeStylePositive);
            configUtils.setConfigElements(config, elements);
            configUtils.setConfigLayout(config, layout);

            selfLoops = clientTableUtils.getSelfLoops(edges);
            edgeDictionary = clientTableUtils.createEdgeDictionaryFromREdges([].concat.apply([], parsedEdges));

            res.json({
                config: config,
                selfLoops: selfLoops,
                edgeDictionary: edgeDictionary
            });
        });
});

app.post('/delta-submatrix', function(req, res) {
    var args = {};
    var argsString = "";
    var selectedGeneNames = [];
    var selectedGenes = req.body.selectedGenes;
    var requestedLayout = req.body.layout;
    var filterValidationRes = validationUtils.validateFilters(req.body);
    console.log(req.body);

    var files = null;

    files = fileUtils.getRequestedFiles(req, availableMatrices, true);

    if (files == null) {
        res.send({ error: "Please specify the necessary files." });
        return;
    } else if (files.error != null) {
        res.send({ error: files.error });
        return;
    }


    if (filterValidationRes.error) {
        res.send(filterValidationRes);
        return;
    }

    if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        res.json({ error: "Please select at least 1 gene of interest." });
        return;
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        selectedGeneNames.push(selectedGenes[i].value);
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

    var child = exec("Rscript R_Scripts/deltaSubmatrix.R --args \"" + argsString + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);

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
                cytoscapeEdges = cytoscapeEdges.concat(edgeUtils.createEdgesFromREdges(parsedEdgesFirst[i], 1));
            }

            firstNeighbourInteractions = cytoscapeEdges;
            cytoscapeEdges = [];

            for (var i = 0; i < parsedEdgesSecond.length; i++) {
                cytoscapeEdges = cytoscapeEdges.concat(edgeUtils.createEdgesFromREdges(parsedEdgesSecond[i], 2));
            }

            secondNeighbourInteractions = cytoscapeEdges;

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
                nodeUtils.positionNodesBipartite(allNodes, 100, 300, 100, 100);
                layout = layoutUtils.createPresetLayout();

                configUtils.addStylesToConfig(config, styleUtils.getAllBipartiteStyles());
                configUtils.addStyleToConfig(config, styleUtils.nodeSize.medium)
            } else if (requestedLayout == 'clustered') {
                var largestClusterSize = 0;
                nodeUtils.addClassToNodes(sourceNodes, "sourceNode");

                for (var i = 0; i < sourceNodes.length; i++) {
                    var clusterSize = nodeUtils.getMinRadius(firstNodes[i] == null ? 0 : firstNodes[i].length, styleUtils.nodeSizes.medium / 2) + nodeUtils.getMinRadius(secondNodes[i] == null ? 0 : secondNodes[i].length, styleUtils.nodeSizes.medium / 2);

                    if (clusterSize > largestClusterSize) {
                        largestClusterSize = clusterSize;
                    }
                }

                for (var i = 0; i < sourceNodes.length; i++) {
                    nodeUtils.positionNodesClustered(sourceNodes[i], firstNodes[i] == null ? [] : firstNodes[i], secondNodes[i] == null ? [] : secondNodes[i], i, sourceNodes.length, styleUtils.nodeSizes.medium / 2, largestClusterSize);
                }

                layout = layoutUtils.createPresetLayout();
                configUtils.addStylesToConfig(config, styleUtils.allConcentricFormats);
            } else {
                layout = layoutUtils.createRandomLayout(allNodes.length, styleUtils.nodeSizes.medium);
                nodeUtils.addClassToNodes(sourceNodes, "sourceNode");
                configUtils.addStylesToConfig(config, styleUtils.allRandomFormats);
            }

            configUtils.addStyleToConfig(config, edgeStyleNegative);
            configUtils.addStyleToConfig(config, edgeStylePositive);
            configUtils.setConfigElements(config, edges.concat(allNodes));
            configUtils.setConfigLayout(config, layout);
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
});

app.post('/delta-get-all-paths', function(req, res) {
    var args = {};
    var argsString = "";
    var source = req.body.source;
    var target = req.body.target;
    var files = null;

    files = fileUtils.getRequestedFiles(req, availableMatrices, false);

    if (files == null) {
        res.send({ error: "Please specify the necessary files." });
        return;
    } else if (files.error != null) {
        res.send({ error: files.error });
        return;
    }

    args.selectedNetworkType = req.body.selectedNetworkType;
    args.fileNameMatrixNormal = files.normal;
    args.fileNameMatrixTumor = files.tumor;
    args.fileNameMatrixDelta = files.delta;

    args.source = source;
    args.target = target;

    argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/deltaGetAllPaths.R --args \"" + argsString + "\"", {
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
        var types = ["weight"];

        if (req.body.selectedNetworkType == 'delta') {
            types.push('normal');
            types.push('tumor');
        }

        res.send({ paths: paths, types: types });
    });

});

app.post('/upload-matrix', function(req, res) {
    if (req.accessLevel == 0) {
        return;
    }

    var file = req.body.file;
    var data = req.body.file.data;
    var user = authenticationUtils.getUserFromToken(req.body.token);

    if (user == null) {
        console.log("Unable to find user for token: " + req.body.token);
        res.send({ error: "Unable to find user for specified token" });
    }

    data = data.replace(/^data:;base64,/, "");

    mkdirp.sync('R_Scripts/Uploaded_Matrices/' + user.name, function(err) {
        if (err) {
            res.send({ error: "Could not create directory for user." })
            console.error(err)
        } else {
            console.log('pow!')
        }
    });

    fs.writeFile('R_Scripts/Uploaded_Matrices/' + user.name + "/" + file.name, data, 'base64', (err) => {
        if (err) {
            console.log(err);
            res.send({ error: "Unable to upload file: " + file.name });
        }
        checkFileIntegrity(req, res, 'R_Scripts/Uploaded_Matrices/' + user.name + "/" + file.name);
    });
});

app.post('/available-matrices', function(req, res) {
    var result = getAvailableMatrices();
    var types = req.body.types;
    var fileNames = [];
    var matrices = {};
    var accessibleMatrices;

    req.accessLevel == 0 || req.accessLevel == null ? accessibleMatrices = result.fake : accessibleMatrices = result.real;

    for (var i = 0; i < types.length; i++) {
        if (Object.keys(accessibleMatrices).indexOf(types[i]) >= 0 && accessibleMatrices[types[i]] != null) {
            matrices[types[i]] = accessibleMatrices[types[i]];
            matrices[types[i]] = matrices[types[i]].map(function(file) {
                return file.fileName
            });
        }
    }

    res.send({ fileList: matrices });
});

app.post('/overall-matrix-stats', function(req, res) {
    var args = {};
    var file;

    if (req.body.fileName.delta != null) {
        file = fileUtils.matchSelectedFile(req.body.fileName.delta, availableMatrices, req.accessLevel);
    } else if (req.body.fileName.normal != null) {
        file = fileUtils.matchSelectedFile(req.body.fileName.normal, availableMatrices, req.accessLevel);
    } else if (req.body.fileName.tumor != null) {
        file = fileUtils.matchSelectedFile(req.body.fileName.tumor, availableMatrices, req.accessLevel);
    }

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
    var fileList = [];
    var result = { real: { normal: [], tumor: [], delta: [] }, fake: { normal: [], tumor: [], delta: [] } };

    var directories = ['normal', 'tumor', 'delta'];

    for (var i = 0; i < directories.length; i++) {
        result.real[directories[i]] = fileUtils.getFilesInDirectory('R_Scripts/User_Matrices/' + directories[i]);
        result.fake[directories[i]] = fileUtils.getFilesInDirectory('R_Scripts/Fake_Matrices/' + directories[i]);
    }

    return result;
}

function checkFileIntegrity(req, res, fileName) {
    var args = {};
    var argsString = "";

    args.fileName = fileName

        argsString = JSON.stringify(args);
    argsString = argsString.replace(/"/g, '\\"');

    var child = exec("Rscript R_Scripts/fileChecker.R --args \"" + argsString + "\"", function(error, stdout, stderr) {
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

function initializeAvaialbleMatrices() {
    var result = getAvailableMatrices();

    availableMatrices = result;
}

function createSampleUser() {
    var salt = bcrypt.genSaltSync(3);
    var password = bcrypt.hashSync('', salt);
    var nick = new User({
        name: '',
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

    var salt = bcrypt.genSaltSync(3);
    var password = bcrypt.hashSync('', salt);
    console.log("password: " + password);

    initializeAvaialbleMatrices();
    console.log(availableMatrices);
    //createSampleUser();
});
