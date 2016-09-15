var geneList = require("./handlers/gene_list").handler;
var minDegreeGenes = require("./handlers/min_degree_genes").handler;
var interactionExplorer = require("./handlers/interaction_explorer").handler;
// var mainGraph = require("./server-utils/handlers/main_graph").handler;
// var getAllPaths = require("./server-utils/handlers/get_all_paths").handler;
// var availableMatrices = require("./server-utils/handlers/available_matrices").handler;
// var deleteMatrixFile = require("./server-utils/handlers/delete_matrix_file").handler;
// var uploadMatrix = require("./server-utils/handlers/upload_matrix").handler;
// var createNewUsers = require("./server-utils/handlers/create_new_users").handler;
// var getAllUserNames = require("./server-utils/handlers/get_all_user_names").handler;
// var deleteUsers = require("./server-utils/delete_users");

module.exports = {
	geneList: geneList,
	minDegreeGenes: minDegreeGenes,
	interactionExplorer: interactionExplorer
	// mainGraph: mainGraph,
	// getAllPaths: getAllPaths,
	// availableMatrices: availableMatrices,
	// deleteMatrixFile: deleteMatrixFile,
	// uploadMatrix: uploadMatrix,
	// createNewUsers: createNewUsers,
	// getAllUserNames: getAllUserNames,
	// deleteUsers: deleteUsers
};