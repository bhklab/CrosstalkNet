createEmptyNodes <- function(amount) {
	# Creates a data frame representing blank ctyoscape nodes.
	#
	# Args:
	#	amount: The number of nodes to preallocate memory for.
	#
	# Returns:
	#	A data frame with amount number of rows of blank cytoscape nodes.
	nodes <- data.frame(name = character(amount), degree = integer(amount), level = integer(amount), isSource = logical(amount), stringsAsFactors = FALSE)

	nodes
}

createEmptyDifferentialEdges <- function(amount) {
	# Creates a data frame representing blank ctyoscape edges.
	#
	# Args:
	#	amount: The number of edges to preallocate memory for.
	#
	# Returns:
	#	A data frame with amount number of rows of blank cytoscape nodes.
	edges <- data.frame(source = character(amount), target = character(amount), weight = numeric(amount), normal = rep(NaN, amount), tumor = rep(NaN, amount), stringsAsFactors = FALSE)

	edges
}

createPaths <- function(amount) {
	# Creates a data frame representing paths between genes.
	#
	# Args:
	#	amount: The number of paths to preallocate memory for.
	#
	# Returns:
	#	A data frame with amount number of rows of blank paths.
	paths <- data.frame(firstEdge = data.frame(weight = numeric(amount), normal = numeric(amount), tumor = numeric(amount)), intermediateGene = character(amount), secondEdge = data.frame(weight = numeric(amount), normal = numeric(amount), tumor = numeric(amount)), stringsAsFactors = FALSE)

	paths
}