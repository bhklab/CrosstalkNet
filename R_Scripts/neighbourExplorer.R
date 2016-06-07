library(jsonlite)

setwd('R_Scripts')
source('helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
selectedGenes <- settings$selectedGenes

corMatrix <- readRDS(paste(path,fileName, sep=""))

if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, ".RData", sep=""))	
} else {
	degrees <- readRDS(paste(path, 'degrees', fileName, sep=""))
}

exclusions <- c()	
edges <- createEmptyEdges()
edgeExclusion <- c()
#nodes <- createEmptyNodes()
nodes <- list()

for (i in 1:length(selectedGenes)) {
    exclusions <- c(exclusions, selectedGenes[i])
    nodesToAdd <- getNeighboursNodes(corMatrix, degrees, selectedGenes[i], exclusions, i, selectedGenes)
    nodes[[i]] <- nodesToAdd
    edges <- rbind(edges, createEdgesDF(corMatrix, selectedGenes[i], edgeExclusion))
    #edgeExclusion <- selectedGenes[i]
    edgeExclusion <- c(edgeExclusion, selectedGenes[i])
    exclusions <- c(exclusions, nodesToAdd$name)
}

result <- list(nodes = nodes, edges = edges)
cat(format(toJSON(result)))