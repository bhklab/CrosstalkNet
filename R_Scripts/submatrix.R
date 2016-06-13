library(jsonlite)

setwd('R_Scripts')
source('helpers.R')

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

corMatrixFirstNeighbours <- readRDS(paste(path, fileName, sep=""))
if (depth > 1) {
	corMatrixSecondNeighbours <- corMatrixFirstNeighbours 	
}

if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, '.RData', sep=""))
} else {
	degrees <- readRDS(paste(path, 'degrees', fileName, sep=""))
}

exclusions <- genesOfInterest
firstNeighboursNodes <- list()
edgesFirst <- list()
edgesSecond <- list()
edgeTestFirst <- c()
edgeTestSecond <- c()

k <- 0
edgeExclusions <- c()

for (i in 1:length(genesOfInterest)) {
    edgesToAdd <- createEdgesDF(corMatrixFirstNeighbours, genesOfInterest[i], edgeExclusions, 0)

    if (weightFilterFirst == TRUE) {
    	edgesToAdd <- filterEdgesByWeight(edgesToAdd, minNegativeWeightFirst, minPositiveWeightFirst)
    }

    edgesFirst[[i]] <- edgesToAdd
    nodesToAdd <- getNeighboursNodesFromEdges(corMatrixFirstNeighbours, degrees, edgesFirst[[i]], 1, genesOfInterest, exclusions)
    firstNeighboursNodes[[i]] <- nodesToAdd

    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    exclusions <- c(exclusions, nodesToAdd$name)
    edgeTestFirst <- c(edgeTestFirst, edgesFirst[[i]]$weight)
}

secondNeighboursNodes <- list()

if (length(firstNeighboursNodes) > 0 && depth == 2) {
	for (i in 1:length(firstNeighboursNodes)) {
		secondNeighboursNodes[[i]] = createEmptyNodes()
		nodesToAdd = createEmptyNodes()
		edgesToAdd <- createEmptyEdges()

		for (j in 1:length(firstNeighboursNodes[[i]]$name)) {
			ptm <- proc.time()
			edgesToAdd <- rbind(edgesToAdd, createEdgesDF(corMatrixSecondNeighbours, firstNeighboursNodes[[i]][j,]$name, edgeExclusions, 30))
			if (weightFilterSecond == TRUE) {
				edgesToAdd <- filterEdgesByWeight(edgesToAdd, minNegativeWeightSecond, minPositiveWeightSecond)
			}
			timeDif <- proc.time() - ptm 
			write("Creating edges took: ", stderr())
			write(timeDif, stderr())

			ptm <- proc.time()
			nodesToAdd <- rbind(nodesToAdd, getNeighboursNodesFromEdges(corMatrixSecondNeighbours, degrees, edgesToAdd, 2, genesOfInterest, exclusions))
			timeDif <- proc.time() - ptm 
			write("Creating nodes took: ", stderr())
			write(timeDif, stderr())
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

if (depth == 1) {
	edgeTest <- edgeTestFirst
} else if (depth == 2) {
	edgeTest <- edgeTestSecond
}

minPositiveWeight <- min(edgeTest[edgeTest > 0])
maxPositiveWeight <- max(edgeTest[edgeTest > 0])

minNegativeWeight <- min(edgeTest[edgeTest < 0])
maxNegativeWeight <- max(edgeTest[edgeTest < 0])

neighboursNodes <- list(first = firstNeighboursNodes, second = secondNeighboursNodes)
edges <- list(first = edgesFirst, second = edgesSecond)

output <- list(neighboursNodes = neighboursNodes, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight)

cat(format(toJSON(output, auto_unbox = TRUE)))