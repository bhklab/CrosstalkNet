library(jsonlite)

source('R_Scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path

degrees <- readFileWithValidation(paste(path, 'degrees', fileName, sep=""))	

output <- list(epiDegrees = degrees$epiDegree, epiDegreesNames = names(degrees$epiDegree), stromaDegrees = degrees$stromaDegree, stromaDegreesNames = names(degrees$stromaDegree))
cat(format(toJSON(output, auto_unbox = TRUE)))