library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
pValue <- args[2]

degrees <- dget(paste('degrees.', pValue, ".R", sep=""))

output <- list(degrees = degrees)
cat(format(serializeJSON(output)))