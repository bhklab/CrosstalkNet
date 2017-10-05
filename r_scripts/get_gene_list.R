options(warn = -1)
library(methods)
library(jsonlite)

source('r_scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path

degrees <- readFileWithValidation(paste(path, fileName, sep=""))	
if (degrees[[1]][1] > degrees[[2]][1])  {
	maxDegree <- degrees[[1]][1]
} else {
	maxDegree <- degrees[[2]][1]
}

output <- list(rowDegrees = degrees[[1]], rowNames = names(degrees[[1]]), colDegrees = degrees[[2]], colNames = names(degrees[[2]]),
			maxDegree = maxDegree)
cat(format(toJSON(output, auto_unbox = TRUE)))