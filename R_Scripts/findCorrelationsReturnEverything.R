library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)
pValue <- args[2]
numberOfNeighbours <- as.numeric(args[3])
selectedGenes <- c()

for (i in 1:numberOfNeighbours) {
    selectedGenes <- c(selectedGenes, as.character(args[3 + i]))
}

#write(paste(first, second, side, pValue), stderr())
corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, ".R", sep=""))

exclusions <- c()	
neighbours <- list()
resultDegrees <- list()
edges <- list()
edgeExclusion <- c()

neighbours[[1]] = selectedGenes
resultDegrees[[1]] = getDegreesForNeighbourNames(degrees, neighbours[[1]])


for (i in 2:length(selectedGenes) + 1) {
    exclusions <- c(exclusions, selectedGenes[i-1])
    neighbours[[i]] = getNeighbourNames(corMatrix, selectedGenes[i-1], exclusions)
    resultDegrees[[i]] = getDegreesForNeighbourNames(degrees, neighbours[[i]])
    edges[[i-1]] <- createEdges(corMatrix, selectedGenes[i-1], edgeExclusion)
    edgeExclusion <- selectedGenes[i-1]
    exclusions <- c(exclusions, neighbours[[i]])
}

result <- list(neighbours = neighbours, degrees = resultDegrees, edges = edges)
cat(format(serializeJSON(result)))