app.post('/neighbour-general', function(req, res) {
    var neighbour = req.body.neighbour;
    var gene = req.body.gene;
    var side = req.body.side.toUpperCase();
    var degree = req.body.degree;
    var originalElements = req.body.originalElements;
    var pValue = req.body.pValue;
    var requestedLayout = req.body.layout;
    var first = req.body.first;
    var second = req.body.second;
    var exclude = 'NA';

    console.log(req.body);

    if (first == second) {
        neighbour = 2;
    } else {
        neighbour = 1;
    }

    if (second != null) {
        exclude = first;
    }

    var neighbourSide = side == "-E" ? "-S" : "-E"
    var child = exec(
        "Rscript R_Scripts/findCorrelations.R --args " +
        "\"" + gene.toUpperCase() +
        "\"" + " " + "\"" + side + "\"" + " " + "\"" + neighbour + "\"" +
        " " + "\"" +
        exclude + "\"" + " " + "\"" +
        pValue + "\"", {
            maxBuffer: 1024 *
                50000
        },
        function(error, stdout, stderr) {
            var elements = [];
            console.log('stderr: ' + stderr);

            if (error != null) {
                console.log('error: ' + error);
            }

            var parsedValue = JSON.parse(stdout);
            console.log(parsedValue);

            var weights = parsedValue.value[0];
            var degrees = parsedValue.value[1].value;
            var hasSelfLoop = parsedValue.value[2].value;
            var neighbourGeneNames = weights.attributes.names.value;
            var dimension = neighbourGeneNames.length;
            var neighbourGeneWeights = weights.value;
            var neighboursGenes = [];
            var resultWeights = [];
            var parent = "";

            if (neighbour == 1) {
                parent = side == "-E" ? "stroma" : "epi";
            } else {
                parent = side == "-E" ? "stromaRight" : "epiRight";
            }

            var neighbourBgColor = side == "-E" ? "red" : "blue";
            var neighbourNodes = nodeUtils.createNodes(neighbourGeneNames,
                parent,
                neighbour == 1 ?
                4 : 8, degrees);
            var sourceNode = nodeUtils.createNodes([gene], side == "-E" ?
                "epi" :
                "stroma", 1, [
                    degree
                ]);
            var sourceBgColor = side == "-E" ? "blue" : "red";

            if (requestedLayout == 'hierarchical') {
                neighbourNodes = nodeUtils.addPositionsToNodes(
                    neighbourNodes,
                    neighbour ==
                    1 ? 400 : 800, 100, 0, 20);
                neighbourNodes = nodeUtils.addStyleToNodes(neighbourNodes,
                    10, 10,
                    "left",
                    "center", neighbourBgColor);


                sourceNode = nodeUtils.addPositionsToNodes(sourceNode, 100,
                    100, 0, 0);
                sourceNode = nodeUtils.addStyleToNodes(sourceNode, 10, 10,
                    "left",
                    "center",
                    sourceBgColor);
            }

            var edges = edgeUtils.createEdgesFromNode(sourceNode[0],
                neighbourNodes,
                neighbourGeneWeights,
                hasSelfLoop);

            if (second == null) {
                elements = elements.concat(sourceNode);

                if (requestedLayout == "hierarchical") {
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
                }
            } else {
                elements = elements.concat(originalElements);

                if (neighbourNodes.length > 0) {
                    if (requestedLayout == "hierarchical") {
                        elements.push({
                            data: {
                                id: side == '-E' ? 'stromaRight' : 'epiRight'
                            }
                        });
                    }
                }

                var opposite = side == "-E" ? "-S" : "-E";

                if (first == second) {
                    if (hasSelfLoop) {
                        elements.push({
                            data: {
                                id: 'selfLoop' + gene,
                                source: gene + side,
                                target: gene + opposite
                            }
                        });
                    }
                }
            }

            elements = elements.concat(neighbourNodes);
            elements = elements.concat(edges);

            var firstEdgeSelector = side == '-S' ? 'EpiToStroma' :
                'StromaToEpi';
            firstEdgeSelector = firstEdgeSelector + gene;
            var config = configUtils.createConfig();

            if (first == second) {
                configUtils.addStyleToConfig(config, {
                    'selector': 'edge[id = "selfLoop' + gene + '"]',
                    'style': styleUtils.selfLoopEdge
                });
                configUtils.addStyleToConfig(config, {
                    'selector': 'edge[id = "' + firstEdgeSelector +
                        '"]',
                    'style': styleUtils.selfLoopEdge
                });
            }

            configUtils.setConfigElements(config, elements);

            var layout = null;
            if (requestedLayout == "hierarchical") {
                layout = configUtils.createPresetLayout();
            } else if (requestedLayout == "concentric") {
                layout = configUtils.createConcentricLayout(sourceNode[0].data
                    .id);
            }

            configUtils.setConfigLayout(config, layout);
            res.json({ config: config });
        });
});
