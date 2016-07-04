library(jsonlite)

source('R_Scripts/helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
selectedGenes <- settings$selectedGenes

corMatrices = list()

if (!is.null(settings$fileNameMatrixNormal)) {
	corMatrixNormal <- readRDS(settings$fileNameMatrixNormal)
	corMatrices[["normal"]] = corMatrixNormal;
}

if (!is.null(settings$fileNameMatrixTumor)) {
	corMatrixTumor <- readRDS(settings$fileNameMatrixTumor)
	corMatrices["tumor"] = corMatrixTumor;
}

if (!is.null(settings$fileNameMatrixDelta)) {
	corMatrixDelta <- readRDS(settings$fileNameMatrixDelta)
	corMatrices["delta"] = corMatrixDelta;
}

degrees <- readRDS(settings$fileNameDegrees)

exclusions <- c()	
edges <- list()
edgeExclusion <- c()
#nodes <- createEmptyNodes()
nodes <- list()
edgeTest <- c()

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