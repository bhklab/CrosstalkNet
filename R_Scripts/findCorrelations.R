library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')
args <- commandArgs(trailingOnly = TRUE)
numberOfNeighbours <- as.numeric(args[2])
selectedGenes <- c()

for (i in 1:numberOfNeighbours) {
	selectedGenes <- c(selectedGenes, as.character(args[2 + i]))
}

pValue <- args[length(args)]

#write(paste(first, second, side, pValue), stderr())
corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, ".R", sep=""))

exclusions <- list()
neighbours <- list()
resultDegrees <- list()

for (i in 1:length(selectedGenes)) {
	exclusions = getExclusions(exclusions, i, selectedGenes)
	neighbours[[i]] = getNeighbours(corMatrix, selectedGenes[i], exclusions[[i]])
	resultDegrees[[i]] = getDegreesForNeighbours(degrees, neighbours[[i]])
}

result <- list(neighbours = neighbours, degrees = resultDegrees)
cat(format(serializeJSON(result)))