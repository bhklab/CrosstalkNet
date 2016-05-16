library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pValue <- as.character(args[2])
minNegativeWeight <- as.numeric(args[3])
minPositiveWeight <- as.numeric(args[4])
weightFilter <- as.character(args[5])
numberOfGenes <- as.character(args[6])
genesOfInterest <- c()

corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep=""))
degrees <- dget(paste('degrees.', pValue, ".R", sep=""))

for (x in 1:numberOfGenes) {
	genesOfInterest <- c(genesOfInterest, as.character(args[6 + x]))
}

maxNeighbours <- 3
epiGenes <- c()
stromaGenes <- c()

for (gene in genesOfInterest) {
	if (tolower(substr(gene, nchar(gene) - 1, nchar(gene))) == "-s") {
		stromaGenes = c(stromaGenes, gene)
	} else {
		epiGenes = c(epiGenes, gene)
	}
}

topFirstNeighbours <- c()
for (gene in stromaGenes) {
	toAppend <- corMatrix[which(corMatrix[, gene] != 0) , gene]
	names(toAppend) <- names(which(corMatrix[, gene] != 0))
	toAppend <- names(which(tail(sort(toAppend), maxNeighbours) != 0))

	topFirstNeighbours <- c(topFirstNeighbours, toAppend)
}

epiGenes <- c(epiGenes, topFirstNeighbours)

topSecondNeighbours <- c()
for (gene in topFirstNeighbours) {
	toAppend <- corMatrix[gene, which(corMatrix[gene, ] != 0)]
	names(toAppend) <- names(which(corMatrix[gene, ] != 0))
	toAppend <- names(which(tail(sort(toAppend), maxNeighbours) != 0))

	topSecondNeighbours <- c(topSecondNeighbours, toAppend)
}

stromaGenes <- c(stromaGenes, topSecondNeighbours)

topFirstNeighbours <- c()
for (gene in epiGenes) {
	write("gene:", stderr())
	write(gene, stderr())
	toAppend <- corMatrix[gene, which(corMatrix[gene, ] != 0)]
	names(toAppend) <- names(which(corMatrix[gene, ] != 0))
	toAppend <- names(which(tail(sort(toAppend), maxNeighbours) != 0))

	topFirstNeighbours <- c(topFirstNeighbours, toAppend)
}

stromaGenes <- c(stromaGenes, topFirstNeighbours)

topSecondNeighbours <- c()
for (gene in topFirstNeighbours) {
	toAppend <- corMatrix[which(corMatrix[, gene] != 0), gene]
	names(toAppend) <- names(which(corMatrix[, gene] != 0))
	toAppend <- names(which(tail(sort(toAppend), maxNeighbours) != 0))

	topSecondNeighbours <- c(topSecondNeighbours, toAppend)
}


epiGenes <- c(epiGenes, topSecondNeighbours)

write("stroma genes", stderr())
write(unique(stromaGenes), stderr())
write("epi genes", stderr())
write(unique(epiGenes), stderr())

weights <- corMatrix[unique(epiGenes), unique(stromaGenes), drop=FALSE]

dput(weights, "temp.Rdata")

#write("weights", stderr())
#write(class(weights), stderr())
#write(weights	, stderr())
write("minNegativeWeight", stderr())
write(minNegativeWeight, stderr())
write("minPositiveWeight", stderr())
write(minPositiveWeight, stderr())

if (weightFilter == 'yes') {
	weights <- filterCorrelationsByWeight(weights, minNegativeWeight, minPositiveWeight)
} 

totalInteractions <- length(which((weights)!=0))
minPositiveWeight <- min(weights[weights > 0])
maxPositiveWeight <- max(weights[weights > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- min(weights[weights < 0])
maxNegativeWeight <- max(weights[weights < 0])

degrees <- getDegrees(weights)

output <- list(degrees = degrees, weights = weights, totalInteractions = totalInteractions, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)

cat(format(serializeJSON(output)))