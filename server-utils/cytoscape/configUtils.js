'use strict'
/**
 * This file contains functions that help create cytoscape.js configs. There
 * are also methods for manipulating those configs by adding styles, layouts,
 * and elements to them.
 *
 * @summary Methods for creating and manipulating configs.
 */

/**
 * Creates a cytoscape.js config with most performance enhancing options
 * enabled. The minimum zoom is set so that users don't get lost by zooming in
 * too far. The config also contains some default styles.
 *
 * @summary Returns a basic cytoscape.js config.
 *
 * @return {Object} A cytoscape.js config.
 */
function createConfig() {
    var config = {
        motionBlur: true,
        hideEdgesOnViewport: true,
        hideLabelsOnViewport: true,
        textureOnViewport: true,
        pixelRatio: 1,
        minZoom: 0.01,
        maxZoom: 5,
        style: [{
            selector: 'node',
            style: {
                'content': 'data(id)',
                'font-size': '10px',
                'color': '#7B1FA2'
            }
        }, {
            selector: ':parent',
            style: {
                'background-opacity': 0.6,
                'label': ''
            }
        }, {
            selector: 'node:selected',
            style: {
                'background-color': 'red'
            }
        }, {
            selector: 'node.located',
            style: {
                'background-color': '#76FF03'
            }
        }, {
            selector: '.faded-edge',
            style: {
                'opacity': '0'
            }
        }, {
            selector: '.highlighted-edge',
            style: {
                'line-color': 'magenta'
            }
        }]
    };

    return config;
}

/**
 * @summary Sets the elements of a cytoscape.js config.
 *
 * @param {Object} config A cytoscape.js config.
 * @param {Array} elements An array of cytoscape.js edges and nodes to add to config.
 * @return {Object} A cytoscape.js config with elements added to it.
 */
function setConfigElements(config, elements) {
    if (elements instanceof Array) {
        config.elements = elements;
    } else {
        var temp = [];
        temp = temp.concat(elements.epiNodes);
        temp = temp.concat(elements.stromaNodes);
        temp = temp.concat(elements.edges);

        if (elements.epiParent != null) {
            temp.push(elements.epiParent);
            temp.push(elements.stromaParent);
        }

        config.elements = temp;
    }

    return config;
}

/**
 * @summary Sets the layout of a cytoscape.js config.
 *
 * @param {Object} config A cytoscape.js config.
 * @param {Object} layout A cytoscape.js layout to add to config.
 * @return {Object} A cytoscape.js config with a layout added to it.
 */
function setConfigLayout(config, layout) {
    config.layout = layout;

    return config;
}

/**
 * @summary Adds a style to a cytoscape.js config.
 *
 * @param {Object} config A cytoscape.js config.
 * @param {Object} style A cytoscape.js style to add to the config.
 * @return {Object} A cytoscape.js config with a style added to it.
 */
function addStyleToConfig(config, style) {
    config.style.push(style);

    return config;
}

/**
 * @summary Adds an array of styles to a cytoscape.js config.
 *
 * @param {Object} config A cytoscape.js config.
 * @param {Object} styles An array of cytoscape.js styles to add to the config.
 * @return {Object} A cytoscape.js config with styles added to it.
 */
function addStylesToConfig(config, styles) {
    for (var i = 0; i < styles.length; i++) {
        config.style.push(styles[i]);
    }

    return config;
}

module.exports = {
    createConfig: createConfig,
    setConfigElements: setConfigElements,
    setConfigLayout: setConfigLayout,
    addStyleToConfig: addStyleToConfig,
    addStylesToConfig: addStylesToConfig
};