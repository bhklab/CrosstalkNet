library(jsonlite)

setwd('R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path

if (pValue != "") {
	degrees <- readRDS(paste(path, 'fulldegrees.', pValue, ".RData", sep=""))	
} else {
	degrees <- readRDS(paste(path, 'degrees', fileName, sep=""))	
}

# output <- list(degrees = degrees)
# cat(format(serializeJSON(output)))

output <- list(epiDegrees = degrees$epiDegree, epiDegreesNames = names(degrees$epiDegree), stromaDegrees = degrees$stromaDegree, stromaDegreesNames = names(degrees$stromaDegree))
cat(format(toJSON(output, auto_unbox = TRUE)))