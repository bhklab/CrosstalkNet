library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
corMatrix <- dget('corMatrix.R')
degrees <- dget('degrees.R')


args <- commandArgs(trailingOnly = TRUE)
gene <- args[2]
side <- args[3]

#gene	
#side
gene <- as.character(gene)
if (side == '-e') {
	resultDegrees <- degrees$stromaDegree[names( which(corMatrix[gene, ] != 0))]
	#print(as.character(which(corMatrix[gene, ] != 0)))
	resultWeights <- corMatrix[gene, names(which(corMatrix[gene, ] != 0))]
	names(resultWeights) <- names( which(corMatrix[gene, ] != 0))
	result <- list(weights = resultWeights, degrees = resultDegrees)
	cat(format(serializeJSON(result)))
} else {
	resultDegrees <- degrees$epiDegree[names( which(corMatrix[, gene] != 0))]
	resultWeights <- corMatrix[names(which(corMatrix[, gene] != 0)), gene]
	names(resultWeights) <- names(which(corMatrix[, gene] != 0))
	result <- list(weights = resultWeights, degrees = resultDegrees)
	cat(format(serializeJSON(result)))
}