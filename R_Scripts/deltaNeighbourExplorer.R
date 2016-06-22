library(jsonlite)

setwd('R_Scripts')
source('helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
selectedGenes <- settings$selectedGenes

corMatrixNormal <- readRDS(settings$fileNameMatrixNormal)
corMatrixTumor <- readRDS(settings$fileNameMatrixTumor)
corMatrixDelta <- readRDS(settings$fileNameMatrixDelta)

degrees <- readRDS(settings$fileNameDegreesDelta)

exclusions <- c()	
edges <- list()
edgeExclusion <- c()
#nodes <- createEmptyNodes()
nodes <- list()
edgeTest <- c()

corMatrices <- list(normal = corMatrixNormal, tumor = corMatrixTumor, delta = corMatrixDelta)

for (i in 1:length(selectedGenes)) {
    edges[[i]] <- createEdgesDFDelta(corMatrices, selectedGenes[i], edgeExclusion, 0)
    nodesToAdd <- getNeighboursNodesFromEdges(corMatrixDelta, degrees, edges[[i]], i, selectedGenes, exclusions)
    nodes[[i]] <- nodesToAdd
    
    #edgeExclusion <- selectedGenes[i]
    exclusions <- c(exclusions, selectedGenes[i])
    edgeExclusion <- c(edgeExclusion, selectedGenes[i])
    exclusions <- c(exclusions, nodesToAdd$name)
    edgeTest <- c(edgeTest, edges[[i]]$weight)
}


minMaxWeightOverall <- getMinMaxWeightValues(edgeTest)
result <- list(nodes = nodes, edges = edges, minMaxWeightOverall = minMaxWeightOverall)
cat(format(toJSON(result)))