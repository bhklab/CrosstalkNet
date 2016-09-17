library(jsonlite)
library(Matrix)

source('r_scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])

filePath <- settings$filePath

corMatrix <- readFileWithValidation(filePath)

if (!(is.matrix(corMatrix))) {
	selfLoops <- length(which(Matrix::diag(corMatrix) != 0))	
} else {
	selfLoops <- length(which(diag(corMatrix) != 0))	
}

significantInteractions <- length(which(corMatrix != 0))

cat(format(toJSON(list(selfLoops = selfLoops, significantInteractions = significantInteractions), auto_unbox = TRUE)))
