library(jsonlite)

source('R_Scripts/helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
selectedGenes <- settings$selectedGenes
selectedNetworkType <- settings$selectedNetworkType

corMatrices <- readMatricesFromFiles(settings$fileNameMatrixNormal, settings$fileNameMatrixTumor, settings$fileNameMatrixDelta)
degrees <- readFileWithValidation(settings$fileNameDegrees)

exclusions <- c()	
edges <- list()
edgeExclusion <- c()
#nodes <- createEmptyNodes()
nodes <- list()
edgeTest <- c()

for (i in 1:length(selectedGenes)) {
    tryCatch({edges[[i]] <- createEdgesDFDelta(corMatrices, selectedGenes[i], edgeExclusion, 0, selectedNetworkType)},
        error = function(err) {cat(format(toJSON(list(status = 1, message = as.character(err)), auto_unbox = TRUE))) ; write(err, stderr()); quit()})

    nodesToAdd <- getNeighboursNodesFromEdges(corMatrices[[selectedNetworkType]], degrees, edges[[i]], i, selectedGenes, exclusions)
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