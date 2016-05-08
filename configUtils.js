// Contains utility functions for creating cytoscape configs and adding layouts to them

module.exports = {
    createConfig: function(elements) {
        var config = {
            elements: elements,
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

        return config;
    },
    addElementsToConfig: function(config, elements) {
        config.elements = elements;

        return config;
    },
    createConcentricLayout: function(levelWidth) {
        var layout = {
            name: 'concentric',
            concentric: function(node) {
                return node.degree();
            },
            levelWidth: function(nodes) {
                return 2;
            }

        }

        return layout;
    },
    createPresetLayout: function() {
    	var layout = {
    		name: "preset"
    	};

    	return layout;
    },
    addLayoutToConfig: function(config, layout) {
    	config.layout = layout;

    	return config;
    }
};
