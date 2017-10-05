options(warn = -1)
library(methods)
library(jsonlite)

source('r_scripts/helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
selectedGenes <- settings$selectedGenes
selectedNetworkType <- settings$selectedNetworkType

corMatrices <- readMatricesFromFiles(settings$fileNameMatrixNormal, 
                                     settings$fileNameMatrixTumor, settings$fileNameMatrixDelta)
# Read the degrees file associated with the selected network type
degrees <- readFileWithValidation(settings$fileNameDegrees)

exclusions <- c()	
edges <- list()
edgeExclusion <- c()
nodes <- list()
edgeTest <- c()

for (i in 1:length(selectedGenes)) {
    tryCatch({edges[[i]] <- createEdgesDFDelta(corMatrices, selectedGenes[i], edgeExclusion, 0, selectedNetworkType)},
        error = function(err) {cat(format(toJSON(list(status = 1, message = as.character(err)), auto_unbox = TRUE))) ; write(err, stderr()); quit()})

    nodesToAdd <- getNeighboursNodesFromEdges(corMatrices[[selectedNetworkType]], degrees, edges[[i]], i, selectedGenes, exclusions)
    nodes[[i]] <- nodesToAdd
    
    # Used to prevent creation of duplicate nodes
    exclusions <- c(exclusions, selectedGenes[i])
    exclusions <- c(exclusions, nodesToAdd$name)
    # Used to prevent creation of duplicate edges
    edgeExclusion <- c(edgeExclusion, selectedGenes[i])
    # Vector of weights to be used for extracting min and max from
    edgeTest <- c(edgeTest, edges[[i]]$weight)
}

rowPost <- getGeneSuffix(rownames(corMatrices[[selectedNetworkType]])[1])
colPost <- getGeneSuffix(colnames(corMatrices[[selectedNetworkType]])[1])

# Get the max and minimum weights to be used for gradient styling by server
minMaxWeightOverall <- getMinMaxWeightValues(edgeTest)
result <- list(nodes = nodes, edges = edges, minMaxWeightOverall = minMaxWeightOverall, rowPost = rowPost, colPost = colPost)
cat(format(toJSON(result)))