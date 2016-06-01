library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')
epiStromaFlag <- TRUE
args <- commandArgs(trailingOnly = TRUE)
# pValue <- args[2]
# fileName < -args[3]
# numberOfNeighbours <- as.numeric(args[4])

settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
selectedGenes <- settings$selectedGenes

ptm <- proc.time()

# for (i in 1:length()) {
#     selectedGenes <- c(selectedGenes, as.character(args[4 + i]))
# }

#write(paste(first, second, side, pValue), stderr())
# corMatrix <- readRDS(paste('Full_Matrices/fullcorMatrix.', pValue, ".RData", sep=""))
# degrees <- readRDS(paste('Full_Matrices/fulldegrees.', pValue, ".RData", sep=""))

corMatrix <- readRDS(paste(path,fileName, sep=""))
if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, ".RData", sep=""))	
} else {
	degrees <- readRDS(paste(path, 'degrees', fileName, sep=""))
}


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

timeDif <- proc.time() - ptm 
write("Significance Test Took: ", stderr())
write(timeDif, stderr())

write("edges length:", stderr())
write(length(edges), stderr())

result <- list(neighbours = neighbours, degrees = resultDegrees, edges = edges)
cat(format(serializeJSON(result)))