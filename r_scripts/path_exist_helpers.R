source('r_scripts/helpers.R')
source('r_scripts/data_models.R')

findAllPaths <- function(source, target, corMatrices, networkType) {
	# Creates a data frame representing all of the paths that exist
	# bewtween the source and target gene with a maximum of 1 hop
	# in between.
	#
	# Args:
	#	
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

				if (networkType == 'delta') {
					if (is.null(neighbours$normal[i]) || is.na(neighbours$normal[i])) {
						paths[numRows + 1, "firstEdge.normal"] = 0
					} else {
						paths[numRows + 1, "firstEdge.normal"] = neighbours$normal[i]
					}

					if (is.null(neighbours$tumor[i]) || is.na(neighbours$tumor[i])) {
						paths[numRows + 1, "firstEdge.tumor"] = 0	
					} else {
						paths[numRows + 1, "firstEdge.tumor"] = neighbours$tumor[i]
					}

					if (is.null(secondLevelNeighbours$normal[target]) || is.na(secondLevelNeighbours$normal[target])) {
						paths[numRows + 1, "secondEdge.normal"] = 0
					} else {
						paths[numRows + 1, "secondEdge.normal"] = secondLevelNeighbours$normal[target]
					}

					if (is.null(secondLevelNeighbours$tumor[target]) || is.na(secondLevelNeighbours$tumor[target])) {
						paths[numRows + 1, "secondEdge.tumor"] = 0
					} else {
						paths[numRows + 1, "secondEdge.tumor"] = secondLevelNeighbours$tumor[target]
					}
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
			paths[1, "firstEdge.weight"] <- neighbours[[networkType]][target]
		}
	}

	paths
}