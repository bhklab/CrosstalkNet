options(warn = -1)
library(methods)
library(jsonlite)
library(data.table)

source('r_scripts/helpers.R')

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
# Read the degrees file associated with the selected network type
degrees <- readFileWithValidation(settings$fileNameDegrees)

nodeExclusions <- genesOfInterest
firstNeighboursNodes <- list()
edgesFirst <- list()
edgesSecond <- list()
edgeTestFirst <- c()
edgeTestSecond <- c()

k <- 0
edgeExclusions <- c()

# Creates nodes and edges for the first neighbours of the selected genes
for (i in 1:length(genesOfInterest)) {
	edgesToAdd <- createEdgesDFDelta(corMatrices, genesOfInterest[i], edgeExclusions, 0, selectedNetworkType)

    if (weightFilterFirst == TRUE) {
    	edgesToAdd <- filterEdgesByWeight(edgesToAdd, minNegativeWeightFirst, minPositiveWeightFirst)
    }

    edgesFirst[[i]] <- edgesToAdd
    nodesToAdd <- getNeighboursNodesFromEdges(corMatrices[[selectedNetworkType]], degrees, edgesFirst[[i]], 1, genesOfInterest, nodeExclusions)
    firstNeighboursNodes[[i]] <- nodesToAdd

    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    nodeExclusions <- c(nodeExclusions, nodesToAdd$name)
    edgeTestFirst <- c(edgeTestFirst, edgesFirst[[i]]$weight)
}

secondNeighboursNodes <- list()
totalTimeEdges <- c(0,0,0,0,0)
totalTimeNodes <- c(0,0,0,0,0)

# Creates nodes and edges for the second neighbours of the selected genes
if (length(firstNeighboursNodes) > 0 && depth == 2) {
	for (i in 1:length(firstNeighboursNodes)) {
		secondNeighboursNodes[[i]] = createEmptyNodes(0)
		nodesToAdd = createEmptyNodes(0)
		edgesToAdd <- createEmptyDifferentialEdges(0)

		# Skip loop iteration if there are no nodes for current first neighbours group
		if (length(firstNeighboursNodes[[i]]$name) == 0) {
			edgesSecond[[i]] = edgesToAdd
			next	
		}

		
		for (j in 1:length(firstNeighboursNodes[[i]]$name)) {
			tempEdges <- createEdgesDFDelta(corMatrices, firstNeighboursNodes[[i]][j,]$name, edgeExclusions, 30, selectedNetworkType)
			edgesToAdd <- rbindlist(list(edgesToAdd, tempEdges))
			

			if (weightFilterSecond == TRUE) {
				edgesToAdd <- filterEdgesByWeight(edgesToAdd, minNegativeWeightSecond, minPositiveWeightSecond)
			}

			tempNodes <- getNeighboursNodesFromEdges(corMatrices[[selectedNetworkType]], degrees, edgesToAdd, 2, genesOfInterest, nodeExclusions)
			nodesToAdd <- rbindlist(list(nodesToAdd, tempNodes))

			nodeExclusions <- c(nodeExclusions, edgesToAdd$target)
			nodeExclusions <- unique(nodeExclusions)
			
			edgeExclusions <- c(edgeExclusions, firstNeighboursNodes[[i]][j,]$name)
		}
		
		edgesSecond[[i]] = edgesToAdd
		edgeExclusions <- unique(edgeExclusions)
		secondNeighboursNodes[[i]] = nodesToAdd
		nodeExclusions <- c(nodeExclusions, secondNeighboursNodes[[i]]$name)
		nodeExclusions <- unique(nodeExclusions)
		edgeTestSecond <- c(edgeTestSecond, edgesSecond[[i]]$weight)
	}	
}

if (depth == 1) {
	edgeTest <- edgeTestFirst
} else if (depth == 2) {
	edgeTest <- edgeTestSecond
}

# Get the max and minimum weights to be used for gradient styling by server
minMaxWeightDepth <- getMinMaxWeightValues(edgeTest)
edgeTest <- c(edgeTestFirst, edgeTestSecond)
minMaxWeightOverall <- getMinMaxWeightValues(edgeTest)

neighboursNodes <- list(first = firstNeighboursNodes, second = secondNeighboursNodes)
edges <- list(first = edgesFirst, second = edgesSecond)

rowPost <- getGeneSuffix(rownames(corMatrices[[selectedNetworkType]])[1])
colPost <- getGeneSuffix(colnames(corMatrices[[selectedNetworkType]])[1])

output <- list(neighboursNodes = neighboursNodes, edges = edges, minMaxWeightDepth = minMaxWeightDepth, 
				minMaxWeightOverall = minMaxWeightOverall, rowPost = rowPost, colPost = colPost)

cat(format(toJSON(output, auto_unbox = TRUE)))