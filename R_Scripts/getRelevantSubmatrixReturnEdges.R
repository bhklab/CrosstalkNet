library(jsonlite)

setwd('R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
# pValue <- as.character(args[2])
# fileName <- args[3]
# minNegativeWeightFirst <- as.numeric(args[4])
# minPositiveWeightFirst <- as.numeric(args[5])
# minNegativeWeightSecond <- as.numeric(args[6])
# minPositiveWeightSecond <- as.numeric(args[7])
# weightFilterFirst <- as.logical(args[8])
# weightFilterSecond <- as.logical(args[9])
# numberOfGenes <- as.character(args[10])
# depth <- as.numeric(args[11])
# genesOfInterest <- c()

settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
minNegativeWeightFirst <- settings$minNegativeWeightFirst
minPositiveWeightFirst <- settings$minPositiveWeightFirst
minNegativeWeightSecond <- settings$minNegativeWeightSecond
minPositiveWeightSecond <- settings$minPositiveWeightSecond
weightFilterFirst <- as.logical(settings$weightFilterFirst)
weightFilterSecond <- as.logical(settings$weightFilterSecond)
depth <- settings$depth
genesOfInterest <- settings$genesOfInterest
# corMatrixFirstNeighbours <- readRDS(paste('Full_Matrices/fullcorMatrix.', pValue, ".RData", sep=""))

corMatrixFirstNeighbours <- readRDS(paste(path, fileName, sep=""))
write("Finished Reading Matrix", stderr())
if (depth > 1) {
	write("Copying Matrix", stderr())
	corMatrixSecondNeighbours <- corMatrixFirstNeighbours 	
	write("Finished copying Matrix", stderr())
}

write("Memory usage", stderr())
write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, '.RData', sep=""))
} else {
	degrees <- readRDS(paste(path, 'degrees', fileName, '.RData', sep=""))
}

if (weightFilterFirst == TRUE) {
	if (is.na(minNegativeWeightFirst)|| is.nan(minNegativeWeightFirst)) {
        corMatrixFirstNeighbours[corMatrixFirstNeighbours < 0] = 0
        minNegativeWeightFirst <- 0
    } 

    write("Memory usage", stderr())
	write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

    if (is.na(minPositiveWeightFirst) || is.nan(minPositiveWeightFirst)) {
        corMatrixFirstNeighbours[corMatrixFirstNeighbours > 0] = 0
        minPositiveWeightFirst <- 0
    }

    write("Memory usage", stderr())
	write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

    corMatrixFirstNeighbours[corMatrixFirstNeighbours >= minNegativeWeightFirst & corMatrixFirstNeighbours < 0] = 0      
    corMatrixFirstNeighbours[corMatrixFirstNeighbours <= minPositiveWeightFirst & corMatrixFirstNeighbours > 0] = 0  

    write("Memory usage", stderr())
	write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

	#corMatrixFirstNeighbours <- filterCorrelationsByWeight(corMatrixFirstNeighbours, minNegativeWeightFirst, minPositiveWeightFirst)
}

if (weightFilterSecond == TRUE) {
	write("Bad!", stderr())
	corMatrixSecondNeighbours <- filterCorrelationsByWeight(corMatrixSecondNeighbours, minNegativeWeightSecond, minPositiveWeightSecond)
} 

# for (x in 1:numberOfGenes) {
# 	genesOfInterest <- c(genesOfInterest, as.character(args[10 + x]))
# }

maxNeighbours <- 3

exclusions <- genesOfInterest
firstNeighbours <- list()
resultDegreesFirst <- list()
edgesFirst <- list()
k <- 0
edgeExclusions <- c()

for (i in 1:length(genesOfInterest)) {
    #exclusions = c(exclusions, genesOfInterest[i]) This is not needed for epi stroma. Might come in useful for epi-epi or stroma-stroma though.
    firstNeighbours[[i]] = getNeighbourNames(corMatrixFirstNeighbours, genesOfInterest[i], exclusions)
    resultDegreesFirst[[i]] = getDegreesForNeighbourNames(degrees, firstNeighbours[[i]])
    edgesFirst[[i]] <- createEdges(corMatrixFirstNeighbours, genesOfInterest[i], edgeExclusions)
    k <- i
    edgeExclusions <- c(edgeExclusions, genesOfInterest[i])
    exclusions <- c(exclusions, firstNeighbours[[i]])
}

write("Memory usage", stderr())
write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

edgesSecond <- list()
secondNeighbours <- list()
resultDegreesSecond <- list()
edgeExclusions <- c(genesOfInterest)

ptm <- proc.time()

if (length(firstNeighbours) > 0 && depth == 2) {
	for (i in 1:length(firstNeighbours)) {
		secondNeighbours[[i]] = c(NA)

		for (j in 1:length(firstNeighbours[[i]])) {
			if (j > 1) {
				secondNeighbours[[i]] = c(secondNeighbours[[i]], getNeighbourNames(corMatrixSecondNeighbours, firstNeighbours[[i]][j], exclusions))		
				edgesSecond[[k + i]] = c(edgesSecond[[k + i]], createEdges(corMatrixSecondNeighbours, firstNeighbours[[i]][j], edgeExclusions))
			} else {
				secondNeighbours[[i]] = getNeighbourNames(corMatrixSecondNeighbours, firstNeighbours[[i]][j], exclusions)
				edgesSecond[[k + i]] = createEdges(corMatrixSecondNeighbours, firstNeighbours[[i]][j], edgeExclusions)	
			}

			exclusions <- c(exclusions, secondNeighbours[[i]])
			edgeExclusions <- c(edgeExclusions, firstNeighbours[[i]][j])
		}
		
		exclusions <- unique(exclusions)
		edgeExclusions <- unique(edgeExclusions)
		resultDegreesSecond[[i]] = getDegreesForNeighbourNames(degrees, secondNeighbours[[i]])
	}	
}

totalInteractions <- 0#length(which((weights)!=0))
if (depth == 1) {
	edgeTest <- na.omit(as.numeric(unlist(edgesFirst)))
} else if (depth == 2) {
	edgeTest <- na.omit(as.numeric(unlist(edgesSecond)))
}

timeDif <- proc.time() - ptm 
write("Getting neighbours took: ", stderr())
write(timeDif, stderr())

minPositiveWeight <- min(edgeTest[edgeTest > 0])
maxPositiveWeight <- max(edgeTest[edgeTest > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- min(edgeTest[edgeTest < 0])
maxNegativeWeight <- max(edgeTest[edgeTest < 0])

write("Memory usage", stderr())
write(sort( sapply(ls(),function(x){object.size(get(x))})), stderr())

resultDegrees <- list(first = resultDegreesFirst, second = resultDegreesSecond)
neighbours <- list(first = firstNeighbours, second = secondNeighbours)
edges <- list(first = edgesFirst, second = edgesSecond)

output <- list(neighbours = neighbours, degrees = resultDegrees, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight)
#output <- list(firstNeighbours = firstNeighbours, resultDegreesFirst = resultDegreesFirst, secondNeighbours = secondNeighbours, resultDegreesSecond = resultDegreesSecond, edges = edges, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)

cat(format(serializeJSON(output)))