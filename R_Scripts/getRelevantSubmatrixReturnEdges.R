library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

ptm <- proc.time()
args <- commandArgs(trailingOnly = TRUE)
pValue <- as.character(args[2])
minNegativeWeight <- as.numeric(args[3])
minPositiveWeight <- as.numeric(args[4])
weightFilter <- as.character(args[5])
numberOfGenes <- as.character(args[6])
depth <- as.numeric(args[7])
genesOfInterest <- c()

corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, '.R', sep=""))

if (weightFilter == 'yes') {
	corMatrix <- filterCorrelationsByWeight(corMatrix, minNegativeWeight, minPositiveWeight)
} 

for (x in 1:numberOfGenes) {
	genesOfInterest <- c(genesOfInterest, as.character(args[7 + x]))
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
    firstNeighbours[[i]] = getNeighbourNames(corMatrix, genesOfInterest[i], exclusions)
    resultDegreesFirst[[i]] = getDegreesForNeighbourNames(degrees, firstNeighbours[[i]])
    edgesFirst[[i]] <- createEdges(corMatrix, genesOfInterest[i], edgeExclusions)
    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    exclusions <- c(exclusions, firstNeighbours[[i]])
}

timeDif <- proc.time() - ptm 
write("First Neighbours took: ", stderr())
write(timeDif, stderr())

edgesSecond <- list()
secondNeighbours <- list()
resultDegreesSecond <- list()
edgeExclusions <- c(genesOfInterest)

ptm <- proc.time()
if (length(firstNeighbours) > 0 && depth == 2) {
	for (i in 1:length(firstNeighbours)) {
		secondNeighbours[[i]] = c(NA)

		for (j in 1:length(firstNeighbours[[i]])) {
			if (j > 1) {
				secondNeighbours[[i]] = c(secondNeighbours[[i]], getNeighbourNames(corMatrix, firstNeighbours[[i]][j], exclusions))		
				edgesSecond[[k + i]] = c(edgesSecond[[k + i]], createEdges(corMatrix, firstNeighbours[[i]][j], edgeExclusions))
			} else {
				secondNeighbours[[i]] = getNeighbourNames(corMatrix, firstNeighbours[[i]][j], exclusions)
				edgesSecond[[k + i]] = createEdges(corMatrix, firstNeighbours[[i]][j], edgeExclusions)	
			}

			exclusions <- c(exclusions, secondNeighbours[[i]])
			edgeExclusions <- c(edgeExclusions, firstNeighbours[[i]][j])
		}
		
		exclusions <- unique(exclusions)
		resultDegreesSecond[[i]] = getDegreesForNeighbourNames(degrees, secondNeighbours[[i]])
	}	
}

timeDifs <- proc.time() - ptm 
write("Second Neighbours took: ", stderr())
write(timeDif, stderr())


totalInteractions <- 0#length(which((weights)!=0))
minPositiveWeight <- 0#min(weights[weights > 0])
maxPositiveWeight <- 0#max(weights[weights > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- 0#min(weights[weights < 0])
maxNegativeWeight <- 0#max(weights[weights < 0])



resultDegrees <- list(first = resultDegreesFirst, second = resultDegreesSecond)
neighbours <- list(first = firstNeighbours, second = secondNeighbours)
edges <- list(first = edgesFirst, second = edgesSecond)

output <- list(neighbours = neighbours, degrees = resultDegrees, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)
#output <- list(firstNeighbours = firstNeighbours, resultDegreesFirst = resultDegreesFirst, secondNeighbours = secondNeighbours, resultDegreesSecond = resultDegreesSecond, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)

cat(format(serializeJSON(output)))