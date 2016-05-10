library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pValue <- args[2]
minNegativeWeight <- as.numeric(args[3])
minPositiveWeight <- as.numeric(args[4])


weights <- dget(paste('corMatrix.', pValue, ".R", sep=""))

if (minNegativeWeight == 0) {
	weights[weights < 0] = 0
} 

if (minPositiveWeight == 0) {
	weights[weights > 0] = 0
}

weights[weights > minNegativeWeight & weights < 0] = 0		
weights[weights < minPositiveWeight & weights > 0] = 0

degrees <- getDegrees(weights)

totalInteractions <- length(which((weights)!=0))
epiToStromaInteractions <- sum(degrees$epiDegree )
stromaToEpiInteractions <- sum(degrees$stromaDegree)

output <- list(degrees = degrees, weights = weights, totalInteractions = totalInteractions, epiToStromaInteractions = epiToStromaInteractions,
	stromaToEpiInteractions = stromaToEpiInteractions)
cat(format(serializeJSON(output)))