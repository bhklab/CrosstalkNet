options(warn = -1)
library(methods)
library(jsonlite)

source('R_Scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path

degrees <- readFileWithValidation(paste(path, fileName, sep=""))	
if (degrees$epiDegree[1] > degrees$stromaDegree[1])  {
	maxDegree <- degrees$epiDegree[1]
} else {
	maxDegree <- degrees$stromaDegree[1]
}

output <- list(epiDegrees = degrees$epiDegree, epiGeneNames = names(degrees$epiDegree), stromaDegrees = degrees$stromaDegree, stromaGeneNames = names(degrees$stromaDegree),
			maxDegree = maxDegree)
cat(format(toJSON(output, auto_unbox = TRUE)))