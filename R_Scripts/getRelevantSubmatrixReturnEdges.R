library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pValue <- as.character(args[2])
minNegativeWeightFirst <- as.numeric(args[3])
minPositiveWeightFirst <- as.numeric(args[4])
minNegativeWeightSecond <- as.numeric(args[5])
minPositiveWeightSecond <- as.numeric(args[6])
weightFilterFirst <- as.logical(args[7])
weightFilterSecond <- as.logical(args[8])
numberOfGenes <- as.character(args[9])
depth <- as.numeric(args[10])
genesOfInterest <- c()

ptm <- proc.time()

corMatrixFirstNeighbours <- readRDS(paste('fullcorMatrix.', pValue, ".RData", sep=""))
corMatrixSecondNeighbours <- corMatrixFirstNeighbours 
degrees <- readRDS(paste('fulldegrees.', pValue, '.RData', sep=""))

if (weightFilterFirst == TRUE) {
	corMatrixFirstNeighbours <- filterCorrelationsByWeight(corMatrixFirstNeighbours, minNegativeWeightFirst, minPositiveWeightFirst)
}

if (weightFilterSecond == TRUE) {
	corMatrixSecondNeighbours <- filterCorrelationsByWeight(corMatrixSecondNeighbours, minNegativeWeightSecond, minPositiveWeightSecond)
} 

for (x in 1:numberOfGenes) {
	genesOfInterest <- c(genesOfInterest, as.character(args[10 + x]))
}

maxNeighbours <- 3

exclusions <- genesOfInterest
firstNeighbours <- list()
resultDegreesFirst <- list()
edgesFirst <- list()
k <- 0
edgeExclusions <- c()

for (i in 1:length(genesOfInterest)) {
    #exclusions = c(exclusions, genesOfInterest[i]) This is not needed for epi stroma. Might come in useful for epi-epi or stroma-stroma though.
    firstNeighbours[[i]] = getNeighbourNames(corMatrixFirstNeighbours, genesOfInterest[i], exclusions)
    resultDegreesFirst[[i]] = getDegreesForNeighbourNames(degrees, firstNeighbours[[i]])
    edgesFirst[[i]] <- createEdges(corMatrixFirstNeighbours, genesOfInterest[i], edgeExclusions)
    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    exclusions <- c(exclusions, firstNeighbours[[i]])
}

edgesSecond <- list()
secondNeighbours <- list()
resultDegreesSecond <- list()
edgeExclusions <- c(genesOfInterest)

if (length(firstNeighbours) > 0 && depth == 2) {
	for (i in 1:length(firstNeighbours)) {
		secondNeighbours[[i]] = c(NA)

		for (j in 1:length(firstNeighbours[[i]])) {
			if (j > 1) {
				secondNeighbours[[i]] = c(secondNeighbours[[i]], getNeighbourNames(corMatrixSecondNeighbours, firstNeighbours[[i]][j], exclusions))		
				edgesSecond[[k + i]] = c(edgesSecond[[k + i]], createEdges(corMatrixSecondNeighbours, firstNeighbours[[i]][j], edgeExclusions))
			} else {
				secondNeighbours[[i]] = getNeighbourNames(corMatrixSecondNeighbours, firstNeighbours[[i]][j], exclusions)
				edgesSecond[[k + i]] = createEdges(corMatrixSecondNeighbours, firstNeighbours[[i]][j], edgeExclusions)	
			}

			exclusions <- c(exclusions, secondNeighbours[[i]])
			edgeExclusions <- c(edgeExclusions, firstNeighbours[[i]][j])
		}
		
		exclusions <- unique(exclusions)
		edgeExclusions <- unique(edgeExclusions)
		resultDegreesSecond[[i]] = getDegreesForNeighbourNames(degrees, secondNeighbours[[i]])
	}	
}

totalInteractions <- 0#length(which((weights)!=0))
if (depth == 1) {
	edgeTest <- na.omit(as.numeric(unlist(edgesFirst)))
} else if (depth == 2) {
	edgeTest <- na.omit(as.numeric(unlist(edgesSecond)))
}

timeDif <- proc.time() - ptm 
write("Getting neighbours took: ", stderr())
write(timeDif, stderr())

minPositiveWeight <- min(edgeTest[edgeTest > 0])
maxPositiveWeight <- max(edgeTest[edgeTest > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- min(edgeTest[edgeTest < 0])
maxNegativeWeight <- max(edgeTest[edgeTest < 0])

resultDegrees <- list(first = resultDegreesFirst, second = resultDegreesSecond)
neighbours <- list(first = firstNeighbours, second = secondNeighbours)
edges <- list(first = edgesFirst, second = edgesSecond)

output <- list(neighbours = neighbours, degrees = resultDegrees, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight)
#output <- list(firstNeighbours = firstNeighbours, resultDegreesFirst = resultDegreesFirst, secondNeighbours = secondNeighbours, resultDegreesSecond = resultDegreesSecond, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)

cat(format(serializeJSON(output)))