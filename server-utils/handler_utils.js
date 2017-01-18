var geneList = require("./handlers/gene_list").handler;
var minDegreeGenes = require("./handlers/min_degree_genes").handler;
var interactionExplorer = require("./handlers/interaction_explorer").handler;
var mainGraph = require("./handlers/main_graph").handler;
var getAllPaths = require("./handlers/get_all_paths").handler;
var overallMatrixStats = require("./handlers/overall_matrix_stats").handler;
var availableMatrices = require("./handlers/available_matrices").handler;
var deleteMatrixFile = require("./handlers/delete_matrix_file").handler;
var uploadMatrices = require("./handlers/upload_matrices").handler;
// var communityExplorer = require("./handlers/community_explorer").handler;
// var deleteCommunityFile = require("./handlers/delete_community_file").handler;
// var uploadCommunityFile = require("./handlers/upload_community_file").handler;
var createNewUsers = require("./handlers/create_new_users").handler;
var getAllUserNames = require("./handlers/get_all_user_names").handler;
var deleteUsers = require("./handlers/delete_users").handler;
var getUserPermission = require('./handlers/get_user_permission').handler;
// var communityFileList = require('./handlers/community_file_list').handler;

module.exports = {
	geneList: geneList,
	minDegreeGenes: minDegreeGenes,
	interactionExplorer: interactionExplorer,
	mainGraph: mainGraph,
	getAllPaths: getAllPaths,
	overallMatrixStats: overallMatrixStats,
	availableMatrices: availableMatrices,
	deleteMatrixFile: deleteMatrixFile,
	uploadMatrices: uploadMatrices,
	// communityExplorer: communityExplorer,
	// deleteCommunityFile: deleteCommunityFile,
	// uploadCommunityFile: uploadCommunityFile,
	createNewUsers: createNewUsers,
	getAllUserNames: getAllUserNames,
	deleteUsers: deleteUsers,
	getUserPermission: getUserPermission,
	// communityFileList: communityFileList
};