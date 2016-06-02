library(jsonlite)

setwd('R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
# pValue <- args[2]
# fileName <- args[3]
settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
# degrees <- readRDS(paste('Full_Matrices/fulldegrees.', pValue, ".RData", sep=""))

if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, ".RData", sep=""))	
} else {
	degrees <- readRDS(paste('degrees', fileName, sep=""))	
}


output <- list(degrees = degrees)
cat(format(serializeJSON(output)))