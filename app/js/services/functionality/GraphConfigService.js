'use strict'

var myModule = angular.module("myApp.services");
myModule.factory('GraphConfigService', function($http) {
    var service = {};

    service.tabNames = { main: "main", neighbour: "neighbour" };
    service.tabs = { main: {}, neighbour: {} };

    service.dataModel = {
        elemCopy: null,
        styleCopy: null,
        cy: null,
        selfLoops: [],
        selfLoopsCount: 0
    };

    service.tabs.main.data = angular.copy(service.dataModel);
    service.tabs.neighbour.data = angular.copy(service.dataModel);

    service.firstSelectedGene = null;

    service.applyConfig = applyConfig;
    service.locateGene = locateGene;
    service.clearLocatedGene = clearLocatedGene;
    service.resetZoom = resetZoom;
    service.destroyGraph = destroyGraph;

    function applyConfig(vm, config, containerID) {
        var cy = null;
        vm.elemCopy = angular.copy(config.elements);
        vm.styleCopy = angular.copy(config.style);
        config.container = document.getElementById(containerID);
        cy = cytoscape(config);

        vm.sdWithinTab.config = config;

        cy.fit(cy.$("*"), 10);

        cy.on('select', 'node', function(evt) {
            var node = evt.cyTarget;
            var id = node.id();
            var edges = cy.edges("[source='" + id + "'], [target='" + id + "']");

            cy.batch(function() {
                for (var i = edges.length - 1; i >= 0; i--) {
                    edges[i].addClass('highlighted-edge');
                    edges[i].removeClass('faded-edge');
                }
            });

            edges = cy.edges().not("[source='" + id + "'], [target='" + id + "']");

            cy.batch(function() {
                for (var i = edges.length - 1; i >= 0; i--) {
                    edges[i].addClass('faded-edge');
                    edges[i].removeClass('highlighted-edge');
                }
            });

            cy.forceRender();

            service.selectedItem = null;
        });

        cy.on("tap", "edge", function(evt) {
            var edge = evt.cyTarget;
            vm.sdWithinTab.selectedEdge = { source: null, target: null, weight: null };

            vm.scope.$apply(function() {
                vm.sdWithinTab.selectedEdge.source = edge.source().id();
                vm.sdWithinTab.selectedEdge.target = edge.target().id();
                vm.sdWithinTab.selectedEdge.weight = edge.data('weight');
            });
        });

        cy.on("unselect", 'node', function(evt) {
            var node = evt.cyTarget;
            var id = node.id();

            resetEdges(vm);
        });

        
        cy.nodes().not(':parent').forEach(function(n) {
            var g = n.data('id').slice(0, -2);
            n.qtip({
                content: [{
                    name: 'Inspector',
                    url: g
                }, {
                    name: 'GeneCard',
                    url: 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
                }].map(function(link) {
                    if (link.name != "Inspector") {
                        return '<a target="_blank" href="' + link.url + '">' + link.name + '</a>';
                    } else {
                        return '<div>' + link.url + '</div>'
                    }
                }).join('<br />\n'),
                position: {
                    my: 'top center',
                    at: 'bottom center'
                },
                style: {
                    classes: 'qtip-bootstrap',
                    tip: {
                        width: 16,
                        height: 8
                    }
                }
            });
        });

        return cy;
    }

    function locateGene(vm, gene) {
        if (gene == '' || gene == null) {
            return;
        }

        service.clearLocatedGene(vm);

        var node = vm.sdWithinTab.cy.$("#" + gene.toUpperCase());
        var x = node.renderedPosition('x');
        var y = node.renderedPosition('y');
        var allClasses = node[0]._private.classes;
        var colorClass = '';

        for (var cls in allClasses) {
            if (cls.indexOf('node-color') >= 0) {
                node.toggleClass(cls);
                colorClass = cls;
                break;
            }
        }

        var jAni = node.animation({
            style: {
                'height': '40px',
                'width': '40px'
            },
            duration: 1000
        });

        jAni
            .play()
            .promise('completed').then(function() {
                jAni
                    .reverse()
                    .rewind()
                    .play();
            });

        node.addClass('located');


        vm.sdWithinTab.cy.zoom({
            level: 1.5, // the zoom level
            renderedPosition: { x: x, y: y }
        });
        vm.sdWithinTab.cy.center(node);

        vm.currentlyZoomed = { node: node, styleClass: colorClass };
    }

    function clearLocatedGene(vm) {
        if (vm.currentlyZoomed != null) {
            vm.currentlyZoomed.node.removeClass('located');
            vm.currentlyZoomed.node.toggleClass(vm.currentlyZoomed.styleClass);
        }

        vm.currentlyZoomed = null;
    }

    function resetEdges(vm) {
        var edges = vm.sdWithinTab.cy.edges();

        vm.sdWithinTab.cy.batch(function() {
            for (var i = edges.length - 1; i >= 0; i--) {
                edges[i].removeClass('highlighted-edge');
                edges[i].removeClass('faded-edge');
            }
        });
    }

    function resetZoom(vm) {
        if (vm.sdWithinTab.cy != null) {
            vm.sdWithinTab.cy.resize();
            vm.sdWithinTab.cy.fit(vm.sdWithinTab.cy.$("*"), 10);
        }
    }

    function destroyGraph(vm) {
        if (vm.sdWithinTab.cy) {
            vm.sdWithinTab.cy.destroy();
        }

        vm.sdWithinTab.cy = null;
    }

    return service;
});
