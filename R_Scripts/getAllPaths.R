options(warn = -1)
library(methods)
library(jsonlite)

source('R_Scripts/helpers.R')
source('R_Scripts/pathExistHelpers.R')
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
source <- settings$source
target <- settings$target

selectedNetworkType <- settings$selectedNetworkType

corMatrices <- readMatricesFromFiles(settings$fileNameMatrixNormal, settings$fileNameMatrixTumor, settings$fileNameMatrixDelta)

tryCatch({paths <- findAllPaths(source, target, corMatrices, selectedNetworkType)},
	error = function(err) {cat(format(toJSON(list(status = 1, message = as.character(err)), auto_unbox = TRUE))) ; write(err, stderr()); quit()})

result <- list(paths = paths)
cat(format(toJSON(result)))