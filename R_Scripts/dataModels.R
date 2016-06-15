createEmptyNodes <- function(amount) {
	nodes <- data.frame(name = character(amount), degree = integer(amount), level = integer(amount), isSource = logical(amount), stringsAsFactors = FALSE)

	nodes
}

createEmptyEdges <- function(amount) {
	edges <- data.frame(source = character(amount), target = character(amount), weight = numeric(amount), stringsAsFactors = FALSE)

	edges
}

createEmptyPaths <- function() {
	paths <- data.frame(firstEdge = numeric(0), intermediateGene = character(0), secondEdge <- numeric(0), stringsAsFactors = FALSE)

	paths
}