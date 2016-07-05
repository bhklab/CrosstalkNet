createEmptyNodes <- function(amount) {
	nodes <- data.frame(name = character(amount), degree = integer(amount), level = integer(amount), isSource = logical(amount), stringsAsFactors = FALSE)

	nodes
}

createEmptyEdges <- function(amount) {
	edges <- data.frame(source = character(amount), target = character(amount), weight = numeric(amount), stringsAsFactors = FALSE)

	edges
}

createEmptyDifferentialEdges <- function(amount) {
	edges <- data.frame(source = character(amount), target = character(amount), weight = numeric(amount), normal = rep(NaN, amount), tumor = rep(NaN, amount), stringsAsFactors = FALSE)

	edges
}

createPaths <- function(amount) {
	paths <- data.frame(firstEdge = data.frame(weight = numeric(amount), normal = numeric(amount), tumor = numeric(amount)), intermediateGene = character(amount), secondEdge = data.frame(weight = numeric(amount), normal = numeric(amount), tumor = numeric(amount)), stringsAsFactors = FALSE)

	paths
}