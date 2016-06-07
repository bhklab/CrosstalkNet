library(jsonlite)

setwd('R_Scripts')
source('helpers.R')
source('pathExistHelpers.R')
args <- commandArgs(trailingOnly = TRUE)
write("args[2]", stderr())
write(args[2], stderr())

settings <- fromJSON(args[2])
fileName <- settings$fileName
path <- settings$path
source <- settings$source
target <- settings$target

	write('getGeneSuffix(source)', stderr())
	write(getGeneSuffix(source), stderr())
	write('getGeneSuffix(target)', stderr())
	write(getGeneSuffix(target), stderr())

corMatrix <- readRDS(paste(path,fileName, sep=""))

paths <- findAllPaths(source, target, corMatrix)

result <- list(paths = paths)
cat(format(toJSON(result)))