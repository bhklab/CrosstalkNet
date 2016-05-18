library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pValue <- as.character(args[2])
minNegativeWeight <- as.numeric(args[3])
minPositiveWeight <- as.numeric(args[4])
weightFilter <- as.character(args[5])
numberOfGenes <- as.character(args[6])
genesOfInterest <- c()

corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, '.R', sep=""))

if (weightFilter == 'yes') {
	corMatrix <- filterCorrelationsByWeight(corMatrix, minNegativeWeight, minPositiveWeight)
} 

for (x in 1:numberOfGenes) {
	genesOfInterest <- c(genesOfInterest, as.character(args[6 + x]))
}

maxNeighbours <- 3

exclusions <- c()#genesOfInterest
firstNeighbours <- list()
resultDegreesFirst <- list()
edges <- list()
k <- 0

for (i in 1:length(genesOfInterest)) {
    exclusions = getExclusionsSubmatrix(exclusions, i, firstNeighbours)
    exclusions = c(exclusions, genesOfInterest[i])
    firstNeighbours[[i]] = getNeighbourNames(corMatrix, genesOfInterest[i], exclusions)
    resultDegreesFirst[[i]] = getDegreesForNeighbourNames(degrees, firstNeighbours[[i]])
    edges[[i]] <- createTopEdges(corMatrix, genesOfInterest[i], exclusions, 10)
    k <- i
}

exclusions <- c(exclusions, firstNeighbours[[1]])
write("Unlisted firstNeighbours: ", stderr())
write(unlist(firstNeighbours), stderr())

secondNeighbours <- list()
resultDegreesSecond <- list()

if (length(firstNeighbours) > 0) {
	for (i in 1:length(firstNeighbours)) {
		secondNeighbours[[i]] = c(NA)
		exclusions = getExclusionsSubmatrix(exclusions, i, secondNeighbours)

		for (j in 1:length(firstNeighbours[[i]])) {
			exclusions = c(exclusions, firstNeighbours[[i]][j])

			if (j > 1) {
				secondNeighbours[[i]] = c(secondNeighbours[[i]], getNeighbourNames(corMatrix, firstNeighbours[[i]][j], exclusions))		
				edges[[k + i]] = c(edges[[k + i]], createTopEdges(corMatrix, firstNeighbours[[i]][j], exclusions, 10))
			} else {
				secondNeighbours[[i]] = getNeighbourNames(corMatrix, firstNeighbours[[i]][j], exclusions)
				edges[[k + i]] = createTopEdges(corMatrix, firstNeighbours[[i]][j], exclusions, 10)	
			}

			exclusions <- unique(c(exclusions, secondNeighbours[[i]]))
		}
		
		resultDegreesSecond[[i]] = getDegreesForNeighbourNames(degrees, secondNeighbours[[i]])
	}	
}

dput(weights, "temp.Rdata")

totalInteractions <- 0#length(which((weights)!=0))
minPositiveWeight <- 0#min(weights[weights > 0])
maxPositiveWeight <- 0#max(weights[weights > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- 0#min(weights[weights < 0])
maxNegativeWeight <- 0#max(weights[weights < 0])


output <- list(firstNeighbours = firstNeighbours, resultDegreesFirst = resultDegreesFirst, secondNeighbours = secondNeighbours, resultDegreesSecond = resultDegreesSecond, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)

cat(format(serializeJSON(output)))