createEmptyNodes <- function() {
	nodes <- data.frame(name = character(0), degree = integer(0), level = integer(0), isSource = logical(0), stringsAsFactors = FALSE)

	nodes
}

createEmptyEdges <- function() {
	edges <- data.frame(source = character(0), target = character(0), weight = numeric(0), stringsAsFactors = FALSE)

	edges
}