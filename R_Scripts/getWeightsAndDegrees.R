library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pvalue <- args[2]

weights <- dget(paste("corMatrix.", pvalue, ".R", sep=""))
degrees <- dget(paste("degrees.", pvalue, ".R", sep=""))
totalInteractions <- length(which((weights)!=0))
epiToStromaInteractions <- sum(degrees$epiDegree )
stromaToEpiInteractions <- sum(degrees$stromaDegree)

output <- list(degrees = degrees, weights = weights, totalInteractions = totalInteractions, epiToStromaInteractions = epiToStromaInteractions,
	stromaToEpiInteractions = stromaToEpiInteractions)
cat(format(serializeJSON(output)))