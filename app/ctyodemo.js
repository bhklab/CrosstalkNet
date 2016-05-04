$(document).ready(function () {
	var cy = cytoscape({
			container : document.getElementById('cy'), // container to render in

			elements : [// list of graph elements to start with
				{ // node a
					data : {
						id : 'a'
					}
				}, { // node b
					data : {
						id : 'b'
					}
				}, { // edge ab
					data : {
						id : 'ab',
						source : 'a',
						target : 'b'
					}
				}, { // node b
					data : {
						id : 'c'
					}
				}, { // node b
					data : {
						id : 'd'
					}
				}, { // edge ab
					data : {
						id : 'cd',
						source : 'c',
						target : 'd'
					}
				}
			],

			style : [// the stylesheet for the graph
				{
					selector : 'node',
					style : {
						'background-color' : '#666',
						'label' : 'data(id)'
					}
				}, {
					selector : 'edge',
					style : {
						'width' : 3,
						'line-color' : '#ccc',
						'target-arrow-color' : '#ccc',
						'target-arrow-shape' : 'triangle'
					}
				}
			],

			layout : {
				name : 'grid',
				rows : 2
			}
		});

	cy.nodes().forEach(function (n) {
		var g = n.data('name');

		n.qtip({
			content : [{
					name : 'GeneCard',
					url : 'http://www.genecards.org/cgi-bin/carddisp.pl?gene=' + g
				}, {
					name : 'UniProt search',
					url : 'http://www.uniprot.org/uniprot/?query=' + g + '&fil=organism%3A%22Homo+sapiens+%28Human%29+%5B9606%5D%22&sort=score'
				}, {
					name : 'GeneMANIA',
					url : 'http://genemania.org/search/human/' + g
				}
			].map(function (link) {
				return '<a target="_blank" href="' + link.url + '">' + link.name + '</a>';
			}).join('<br />\n'),
			position : {
				my : 'top center',
				at : 'bottom center'
			},
			style : {
				classes : 'qtip-bootstrap',
				tip : {
					width : 16,
					height : 8
				}
			}
		});

		console.log(cy);
	});
	
	function addNodes() {
	cy.add({ // node a
		data : {
			id : 'e'
		}
	}, { // node b
		data : {
			id : 'f'
		}
	}, { // edge ab
		data : {
			id : 'ef',
			source : 'e',
			target : 'f'
		}
	});
}

});

