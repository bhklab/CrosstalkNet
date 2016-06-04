library(jsonlite)

setwd('R_Scripts')
source('helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])

fileName <- settings$fileName
path <- settings$path

corMatrix <- readRDS(paste(path, fileName, sep=""))

selfLoops <- length(which(diag(corMatrix) != 0))
significantInteractions <- length(which(corMatrix != 0))

cat(format(serializeJSON(list(selfLoops = selfLoops, significantInteractions = significantInteractions))))
