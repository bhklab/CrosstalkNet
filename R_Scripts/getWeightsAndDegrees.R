library(jsonlite)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pvalue <- args[2]

weights <- dget(paste("corMatrix.", pvalue, ".R", sep=""))
degrees <- dget(paste("degrees.", pvalue, ".R", sep=""))

output <- list(degrees = degrees, weights = weights)
cat(format(serializeJSON(output)))