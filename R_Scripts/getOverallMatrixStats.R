library(jsonlite)
library(Matrix)

setwd('R_Scripts')
source('helpers.R')

ptm <- proc.time()

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])

fileName <- settings$fileName
path <- settings$path

corMatrix <- readRDS(paste(path, fileName, sep=""))

if (!(is.matrix(corMatrix))) {
	selfLoops <- length(which(Matrix::diag(corMatrix) != 0))	
} else {
	selfLoops <- length(which(diag(corMatrix) != 0))	
}

timedif <- proc.time() - ptm
write("overall stats took:", stderr())
write(timedif, stderr())

significantInteractions <- length(which(corMatrix != 0))

cat(format(toJSON(list(selfLoops = selfLoops, significantInteractions = significantInteractions), auto_unbox = TRUE)))
