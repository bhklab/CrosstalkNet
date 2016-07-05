library(jsonlite)

source('R_Scripts/helpers.R')
source('R_Scripts/pathExistHelpers.R')
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
fileName <- settings$fileName
path <- settings$path
source <- settings$source
target <- settings$target

selectedNetworkType <- settings$selectedNetworkType

corMatrices = list()

if (!is.null(settings$fileNameMatrixNormal)) {
	corMatrixNormal <- readRDS(settings$fileNameMatrixNormal)
	corMatrices[["normal"]] = corMatrixNormal;
}

if (!is.null(settings$fileNameMatrixTumor)) {
	corMatrixTumor <- readRDS(settings$fileNameMatrixTumor)
	corMatrices[["tumor"]] = corMatrixTumor;
}

if (!is.null(settings$fileNameMatrixDelta)) {
	corMatrixDelta <- readRDS(settings$fileNameMatrixDelta)
	corMatrices[["delta"]] = corMatrixDelta;
}

paths <- findAllPaths(source, target, corMatrices, selectedNetworkType)

result <- list(paths = paths)
cat(format(toJSON(result)))