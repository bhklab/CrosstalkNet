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

for (i in 1:length(selectedGenes)) {
    exclusions <- c(exclusions, selectedGenes[i])
    neighbours[[i]] = getNeighbourNames(corMatrix, selectedGenes[i], exclusions)
    resultDegrees[[i]] = getDegreesForNeighbourNames(degrees, neighbours[[i]])
    edges[[i]] <- createEdges(corMatrix, selectedGenes[i], edgeExclusion)
    edgeExclusion <- selectedGenes[i]
    exclusions <- c(exclusions, neighbours[[i]])
}

write("edges length:", stderr())
write(length(edges), stderr())

result <- list(neighbours = neighbours, degrees = resultDegrees, edges = edges)
cat(format(serializeJSON(result)))