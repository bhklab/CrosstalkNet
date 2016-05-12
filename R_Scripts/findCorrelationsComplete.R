library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')

args <- commandArgs(trailingOnly = TRUE)
first <- as.character(args[2])
second <- as.character(args[3])
side <- args[4]
pValue <- args[5]

write(paste(first, second, side, pValue), stderr())
corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, ".R", sep=""))

if (tolower(second) != 'null') {
	if (side == "-E") {
		side = '-S'
	} else {
		side = '-E'
	}
}

hasSelfLoop <- FALSE
if (side == '-E') { # First neighbour gene is an epi gene
	firstNeighboursIndex <- which(corMatrix[first, ] != 0)
	secondNeighboursIndex <- c()

	if (tolower(second) != 'null') {
		secondNeighboursIndex <- which(corMatrix[, second] != 0)
		secondNeighboursIndex <- secondNeighboursIndex[which(names(secondNeighboursIndex) != first)]

		secondNeigboursWeights <- corMatrix[secondNeighboursIndex, second]
		names(secondNeigboursWeights) <- names(secondNeighboursIndex)

		secondNeighboursDegrees <- degrees$epiDegree[secondNeighboursIndex]
	} else {
		secondNeigboursWeights <- c()
		secondNeighboursDegrees <- c()
	}
	
	firstNeighboursWeights <- corMatrix[first, firstNeighboursIndex]
	names(firstNeighboursWeights) <- names(firstNeighboursIndex)

	firstNeighboursDegrees <- degrees$stromaDegree[firstNeighboursIndex]

	result <- list(firstNeighboursWeights = firstNeighboursWeights, secondNeigboursWeights = secondNeigboursWeights, 
		firstNeighboursDegrees = firstNeighboursDegrees, secondNeighboursDegrees = secondNeighboursDegrees)
	cat(format(serializeJSON(result)))
} else { # First neighbour gene is a stroma gene
	firstNeighboursIndex <- which(corMatrix[, first] != 0)
	secondNeighboursIndex <- c()

	if (tolower(second) != 'null') {
		secondNeighboursIndex <- which(corMatrix[second, ] != 0)
		secondNeighboursIndex <- secondNeighboursIndex[which(names(secondNeighboursIndex) != first)]

		secondNeigboursWeights <- corMatrix[second, secondNeighboursIndex]
		names(secondNeigboursWeights) <- names(secondNeighboursIndex)

		secondNeighboursDegrees <- degrees$epiDegree[secondNeighboursIndex]
	} else {
		secondNeigboursWeights <- c()
		secondNeighboursDegrees <- c()
	}

	firstNeighboursWeights <- corMatrix[firstNeighboursIndex, first]
	names(firstNeighboursWeights) <- names(firstNeighboursIndex)

	firstNeighboursDegrees <- degrees$stromaDegree[firstNeighboursIndex]
	
	result <- list(firstNeighboursWeights = firstNeighboursWeights, secondNeigboursWeights = secondNeigboursWeights, 
		firstNeighboursDegrees = firstNeighboursDegrees, secondNeighboursDegrees = secondNeighboursDegrees)
	cat(format(serializeJSON(result)))
}