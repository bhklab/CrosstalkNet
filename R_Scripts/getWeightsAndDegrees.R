library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pvalue <- args[2]

ptm <- proc.time()
weights <- dget(paste("corMatrix.", pvalue, ".R", sep=""))

timeDif <- proc.time() - ptm 
write("Loading Weights Took: ", stderr())
write(timeDif, stderr())

ptm <- proc.time()
degrees <- dget(paste("degrees.", pvalue, ".R", sep=""))

timeDif <- proc.time() - ptm 
write("Loading Degrees Took: ", stderr())
write(timeDif, stderr())

totalInteractions <- length(which((weights)!=0))
minPositiveWeight <- min(weights[weights > 0])
maxPositiveWeight <- max(weights[weights > 0])

#Min negative weight means the negative weight with that smallest magnitude, not value
minNegativeWeight <- min(weights[weights < 0])
maxNegativeWeight <- max(weights[weights < 0])

output <- list(degrees = degrees, weights = weights, totalInteractions = totalInteractions, minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)
#write(serializeJSON(output), stderr())
cat(format(serializeJSON(output)))