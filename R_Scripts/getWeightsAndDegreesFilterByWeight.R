library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pValue <- args[2]
minNegativeWeight <- as.numeric(args[3])
minPositiveWeight <- as.numeric(args[4])
weightFilter <- args[5]


weights <- dget(paste('corMatrix.', pValue, ".R", sep=""))

if (weightFilter == 'yes') {
	weights <- filterCorrelationsByWeight(weights, minNegativeWeight, minPositiveWeight)
} 

degrees <- getDegrees(weights)

totalInteractions <- length(which((weights)!=0))
minPositiveWeight <- min(weights[weights > 0])
maxPositiveWeight <- max(weights[weights > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- min(weights[weights < 0])
maxNegativeWeight <- max(weights[weights < 0])

output <- list(degrees = degrees, weights = weights, totalInteractions = totalInteractions, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)
cat(format(serializeJSON(output)))