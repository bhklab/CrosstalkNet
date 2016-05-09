library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')

args <- commandArgs(trailingOnly = TRUE)
gene <- args[2]
side <- args[3]
neighbour <- args[4]
pValue <- args[5]

corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, ".R", sep=""))

#gene	
#side
hasSelfLoop <- FALSE
gene <- as.character(gene)
if (side == '-e') {
	index <- which(corMatrix[gene, ] != 0)
	if (neighbour != '1') {
		if (length(which(names(index) == gene)) > 0) {
			hasSelfLoop <- TRUE
		} else {
			hasSelfLoop <- FALSE
		}

		index <- index[which(names(index) != gene)]	
	}
	
	resultDegrees <- degrees$stromaDegree[index]#degrees$stromaDegree[names( which(corMatrix[gene, ] != 0))]
	#print(as.character(which(corMatrix[gene, ] != 0)))
	resultWeights <- corMatrix[gene, index]#corMatrix[gene, names(which(corMatrix[gene, ] != 0))]
	names(resultWeights) <- names(index)
	result <- list(weights = resultWeights, degrees = resultDegrees, hasSelfLoop = hasSelfLoop)
	cat(format(serializeJSON(result)))
} else {
	index <- which(corMatrix[, gene] != 0)
	if (neighbour != '1') {
		if (length(which(names(index) == gene)) > 0) {
			hasSelfLoop <- TRUE
		} else {
			hasSelfLoop <- FALSE
		}

		index <- index[which(names(index) != gene)]	
	}
	
	resultDegrees <- degrees$epiDegree[index]
	resultWeights <- corMatrix[index, gene]
	names(resultWeights) <- names(index)
	result <- list(weights = resultWeights, degrees = resultDegrees, hasSelfLoop = hasSelfLoop)
	cat(format(serializeJSON(result)))
}