source('helpers.R')
source('dataModels.R')

findAllPaths <- function(source, target, corMatrix) {
	neighbours <- c()
	paths <- createEmptyPaths()
	result <- list(paths = NULL)
	write('getGeneSuffix(source)', stderr())
	write(getGeneSuffix(source), stderr())
	write('getGeneSuffix(target)', stderr())
	write(getGeneSuffix(target), stderr())

	if (getGeneSuffix(source) == getGeneSuffix(target)) {
		neighbours <- getNeighbours(corMatrix, source, c())

		for (i in 1:length(neighbours)) {
			secondLevelNeighbours <- getNeighbours(corMatrix, names(neighbours[i]), c())
			write(' neighbours[i]', stderr())
			write(neighbours[i], stderr())
			write('secondLevelNeighbours', stderr())
			write(secondLevelNeighbours, stderr())
			if (target %in% names(secondLevelNeighbours)) {

				numRows <- nrow(paths) 
				paths[numRows + 1, "firstEdge"] = neighbours[i]
				paths[numRows + 1, "intermediateNode"] = names(neighbours[i])
				paths[numRows + 1, "secondEdge"] = secondLevelNeighbours[target]
			}
		}
	} else {
		neighbours <- getNeighbours(corMatrix, source, c())

		if (target %in% names(neighbours)) {
			paths[1, ]$firstEdge <- neighbours[target]
		}
	}

	paths
}