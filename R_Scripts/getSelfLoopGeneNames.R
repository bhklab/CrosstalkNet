library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pvalue <- args[2]

parsedWeights <- dget(paste("corMatrix.", pvalue, ".R", sep=""))

geneNames <- names(which(diag(parsedWeights)!=0))
numberOfLoops <- length(geneNames)

output <- list(geneNames = geneNames, numberOfLoops = numberOfLoops)
cat(format(serializeJSON(output)))


