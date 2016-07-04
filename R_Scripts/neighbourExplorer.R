library(jsonlite)

source('R_Scripts/helpers.R')
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
edges <- list()
edgeExclusion <- c()
#nodes <- createEmptyNodes()
nodes <- list()
edgeTest <- c()

for (i in 1:length(selectedGenes)) {
    edges[[i]] <- createEdgesDF(corMatrix, selectedGenes[i], edgeExclusion, 0)
    nodesToAdd <- getNeighboursNodesFromEdges(corMatrix, degrees, edges[[i]], i, selectedGenes, exclusions)
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