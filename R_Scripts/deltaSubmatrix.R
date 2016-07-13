library(jsonlite)

source('R_Scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
minNegativeWeightFirst <- as.numeric(settings$minNegativeWeightFirst)
minPositiveWeightFirst <- as.numeric(settings$minPositiveWeightFirst)
minNegativeWeightSecond <- as.numeric(settings$minNegativeWeightSecond)
minPositiveWeightSecond <- as.numeric(settings$minPositiveWeightSecond)
weightFilterFirst <- as.logical(settings$weightFilterFirst)
weightFilterSecond <- as.logical(settings$weightFilterSecond)
depth <- settings$depth
genesOfInterest <- settings$genesOfInterest

selectedNetworkType <- settings$selectedNetworkType

corMatrices <- readMatricesFromFiles(settings$fileNameMatrixNormal, settings$fileNameMatrixTumor, settings$fileNameMatrixDelta)
degrees <- readFileWithValidation(settings$fileNameDegrees)

exclusions <- genesOfInterest
firstNeighboursNodes <- list()
edgesFirst <- list()
edgesSecond <- list()
edgeTestFirst <- c()
edgeTestSecond <- c()

k <- 0
edgeExclusions <- c()

for (i in 1:length(genesOfInterest)) {
	tryCatch({edgesToAdd <- createEdgesDFDelta(corMatrices, genesOfInterest[i], edgeExclusions, 0, selectedNetworkType)},
		error = function(err) {cat(format(toJSON(list(status = 1, message = as.character(err)), auto_unbox = TRUE))) ; write(err, stderr()); quit()})
    # edgesToAdd <- createEdgesDFDelta(corMatrices, genesOfInterest[i], edgeExclusions, 0, selectedNetworkType)

    if (weightFilterFirst == TRUE) {
    	edgesToAdd <- filterEdgesByWeight(edgesToAdd, minNegativeWeightFirst, minPositiveWeightFirst)
    }

    edgesFirst[[i]] <- edgesToAdd
    nodesToAdd <- getNeighboursNodesFromEdges(corMatrices[[selectedNetworkType]], degrees, edgesFirst[[i]], 1, genesOfInterest, exclusions)
    firstNeighboursNodes[[i]] <- nodesToAdd

    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    exclusions <- c(exclusions, nodesToAdd$name)
    edgeTestFirst <- c(edgeTestFirst, edgesFirst[[i]]$weight)
}

secondNeighboursNodes <- list()
totalTimeEdges <- c(0,0,0,0,0)
totalTimeNodes <- c(0,0,0,0,0)

if (length(firstNeighboursNodes) > 0 && depth == 2) {
	for (i in 1:length(firstNeighboursNodes)) {
		secondNeighboursNodes[[i]] = createEmptyNodes(0)
		nodesToAdd = createEmptyNodes(0)
		edgesToAdd <- createEmptyDifferentialEdges(0)

		if (length(firstNeighboursNodes[[i]]$name) == 0) {
			edgesSecond[[i]] = edgesToAdd
			next	
		}

		for (j in 1:length(firstNeighboursNodes[[i]]$name)) {
			write("length(firstNeighboursNodes[[i]]$name", stderr())
			write(length(firstNeighboursNodes[[i]]$name), stderr())
			edgesToAdd <- rbind(edgesToAdd, createEdgesDFDelta(corMatrices, firstNeighboursNodes[[i]][j,]$name, edgeExclusions, 30, selectedNetworkType))
			if (weightFilterSecond == TRUE) {
				edgesToAdd <- filterEdgesByWeight(edgesToAdd, minNegativeWeightSecond, minPositiveWeightSecond)
			}

			nodesToAdd <- rbind(nodesToAdd, getNeighboursNodesFromEdges(corMatrices[[selectedNetworkType]], degrees, edgesToAdd, 2, genesOfInterest, exclusions))

			exclusions <- c(exclusions, edgesToAdd$target)
			edgeExclusions <- c(edgeExclusions, firstNeighboursNodes[[i]][j,]$name)
		}
		
		edgesSecond[[i]] = edgesToAdd
		edgeExclusions <- unique(edgeExclusions)
		secondNeighboursNodes[[i]] = nodesToAdd
		exclusions <- c(exclusions, secondNeighboursNodes[[i]]$name)
		exclusions <- unique(exclusions)
		edgeTestSecond <- c(edgeTestSecond, edgesSecond[[i]]$weight)
	}	
}
write("edgeTestSecond", stderr())
write(edgeTestSecond, stderr())

if (depth == 1) {
	edgeTest <- edgeTestFirst
} else if (depth == 2) {
	edgeTest <- edgeTestSecond
}

minMaxWeightDepth <- getMinMaxWeightValues(edgeTest)
edgeTest <- c(edgeTestFirst, edgeTestSecond)
minMaxWeightOverall <- getMinMaxWeightValues(edgeTest)

neighboursNodes <- list(first = firstNeighboursNodes, second = secondNeighboursNodes)
edges <- list(first = edgesFirst, second = edgesSecond)

output <- list(neighboursNodes = neighboursNodes, edges = edges, minMaxWeightDepth = minMaxWeightDepth, minMaxWeightOverall = minMaxWeightOverall)

cat(format(toJSON(output, auto_unbox = TRUE)))