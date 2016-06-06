library(jsonlite)

setwd('R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
minNegativeWeightFirst <- settings$minNegativeWeightFirst
minPositiveWeightFirst <- settings$minPositiveWeightFirst
minNegativeWeightSecond <- settings$minNegativeWeightSecond
minPositiveWeightSecond <- settings$minPositiveWeightSecond
weightFilterFirst <- as.logical(settings$weightFilterFirst)
weightFilterSecond <- as.logical(settings$weightFilterSecond)
depth <- settings$depth
genesOfInterest <- settings$genesOfInterest

corMatrixFirstNeighbours <- readRDS(paste(path, fileName, sep=""))
write("Finished Reading Matrix", stderr())
if (depth > 1) {
	write("Copying Matrix", stderr())
	corMatrixSecondNeighbours <- corMatrixFirstNeighbours 	
	write("Finished copying Matrix", stderr())
}

write("Memory usage", stderr())
write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, '.RData', sep=""))
} else {
	degrees <- readRDS(paste(path, 'degrees', fileName, sep=""))
}

if (weightFilterFirst == TRUE) {
	corMatrixFirstNeighbours <- filterCorrelationsByWeight(corMatrixFirstNeighbours, minNegativeWeightFirst, minPositiveWeightFirst)
}

if (weightFilterSecond == TRUE) {
	corMatrixSecondNeighbours <- filterCorrelationsByWeight(corMatrixSecondNeighbours, minNegativeWeightSecond, minPositiveWeightSecond)
} 

maxNeighbours <- 3

exclusions <- genesOfInterest
firstNeighboursNodes <- list()
edgesFirst <- createEmptyEdges()
edgesSecond <- createEmptyEdges()

k <- 0
edgeExclusions <- c()

for (i in 1:length(genesOfInterest)) {
    #exclusions = c(exclusions, genesOfInterest[i]) This is not needed for epi stroma. Might come in useful for epi-epi or stroma-stroma though.
    nodesToAdd <- getNeighboursNodes(corMatrixFirstNeighbours, degrees, genesOfInterest[i], exclusions, 1, genesOfInterest)
    firstNeighboursNodes[[i]] <- nodesToAdd
    edgesFirst <- rbind(edgesFirst, createEdgesDF(corMatrixFirstNeighbours, genesOfInterest[i], edgeExclusions))

    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    exclusions <- c(exclusions, nodesToAdd$name)
}

secondNeighboursNodes <- list()

if (length(firstNeighboursNodes) > 0 && depth == 2) {
	for (i in 1:length(firstNeighboursNodes)) {
		secondNeighboursNodes[[i]] = createEmptyNodes()

		for (j in 1:length(firstNeighboursNodes[[i]]$name)) {
			nodesToAdd <- getNeighboursNodes(corMatrixSecondNeighbours, degrees, firstNeighboursNodes[[i]][j,]$name, exclusions, 2, genesOfInterest)
			edgesToAdd <- createEdgesDF(corMatrixSecondNeighbours, firstNeighboursNodes[[i]][j,]$name, edgeExclusions)

			if (j > 1) {
				secondNeighboursNodes[[i]] = rbind(secondNeighboursNodes[[i]], nodesToAdd)		
			} else {
				secondNeighboursNodes[[i]] = nodesToAdd
			}

			edgesSecond = rbind(edgesSecond, edgesToAdd)
			exclusions <- c(exclusions, secondNeighboursNodes[[i]]$name)
			edgeExclusions <- c(edgeExclusions, firstNeighboursNodes[[i]][j,]$name)
		}
		
		exclusions <- unique(exclusions)
		edgeExclusions <- unique(edgeExclusions)
	}	
}

totalInteractions <- 0#length(which((weights)!=0))
if (depth == 1) {
	edgeTest <- edgesFirst$weight
} else if (depth == 2) {
	edgeTest <- edgesSecond$weight
}

minPositiveWeight <- min(edgeTest[edgeTest > 0])
maxPositiveWeight <- max(edgeTest[edgeTest > 0])

minNegativeWeight <- min(edgeTest[edgeTest < 0])
maxNegativeWeight <- max(edgeTest[edgeTest < 0])

neighboursNodes <- list(first = firstNeighboursNodes, second = secondNeighboursNodes)
edges <- list(first = edgesFirst, second = edgesSecond)

output <- list(neighboursNodes = neighboursNodes, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight)

cat(format(toJSON(output, auto_unbox = TRUE)))