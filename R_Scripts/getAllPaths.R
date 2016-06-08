library(jsonlite)

setwd('R_Scripts')
source('helpers.R')
source('pathExistHelpers.R')
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
fileName <- settings$fileName
path <- settings$path
source <- settings$source
target <- settings$target

corMatrix <- readRDS(paste(path,fileName, sep=""))

paths <- findAllPaths(source, target, corMatrix)

result <- list(paths = paths)
cat(format(toJSON(result)))