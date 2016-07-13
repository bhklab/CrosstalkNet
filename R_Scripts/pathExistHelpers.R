source('R_Scripts/helpers.R')
source('R_Scripts/dataModels.R')

findAllPaths <- function(source, target, corMatrices, networkType) {
	neighbours <- list(normal = NULL, tumor = NULL, delta = NULL)
	paths <- createPaths(0)
	result <- list(paths = NULL)
	
	if (getGeneSuffix(source) == getGeneSuffix(target)) {
		for (i in names(corMatrices)) {
            neighbours[[i]] = getNeighbours(corMatrices[[i]], source, c())
        }

		if (length(neighbours[[networkType]]) < 1) {
			return(paths)
		}

		for (i in 1:length(neighbours[[networkType]])) {
			secondLevelNeighbours <- list(normal = NULL, tumor = NULL, delta = NULL)

			for (name in names(corMatrices)) {
            	secondLevelNeighbours[[name]] = getNeighbours(corMatrices[[name]], names(neighbours[[name]][i]), c())
        	}

			if (target %in% names(secondLevelNeighbours[[networkType]])) {
				numRows <- nrow(paths) 
				paths[numRows + 1, "firstEdge.weight"] = neighbours[[networkType]][i]
				paths[numRows + 1, "intermediateNode"] = names(neighbours[[networkType]][i])
				paths[numRows + 1, "secondEdge.weight"] = secondLevelNeighbours[[networkType]][target]
				write("networkType", stderr())
				write(networkType, stderr())

				if (networkType == 'delta') {
					paths[numRows + 1, "firstEdge.normal"] = neighbours$normal[i]
					paths[numRows + 1, "firstEdge.tumor"] = neighbours$tumor[i]

					paths[numRows + 1, "secondEdge.normal"] = secondLevelNeighbours$normal[target]
					paths[numRows + 1, "secondEdge.tumor"] = secondLevelNeighbours$tumor[target]
				}
			}
		}
	} else {
		for (i in names(corMatrices)) {
            neighbours[[i]] = getNeighbours(corMatrices[[i]], source, c())
        }

		if (length(neighbours[[networkType]]) < 1) {
			return(paths)
		}

		if (target %in% names(neighbours[[networkType]])) {
			paths[1, ]$firstEdge$weight <- neighbours[[networkType]][target]
		}
	}

	write(warnings(), stderr())

	paths
}