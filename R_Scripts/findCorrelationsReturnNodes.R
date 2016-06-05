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
edges <- data.frame(source = character(0), target = character(0), weight = numeric(0), stringsAsFactors = FALSE)
edgeExclusion <- c()
nodes <- data.frame(name = character(0), degree = integer(0), level = integer(0), isSource = logical(0), stringsAsFactors = FALSE)

for (i in 1:length(selectedGenes)) {
    exclusions <- c(exclusions, selectedGenes[i])
    nodesToAdd <- getNeighboursNodes(corMatrix, degrees, selectedGenes[i], exclusions, i, selectedGenes)
    nodes <- rbind(nodes, nodesToAdd)
    edges <- rbind(edges, createEdgesDF(corMatrix, selectedGenes[i], edgeExclusion))
    edgeExclusion <- selectedGenes[i]
    exclusions <- c(exclusions, nodesToAdd$name)
}

result <- list(nodes = nodes, edges = edges)
cat(format(toJSON(result)))