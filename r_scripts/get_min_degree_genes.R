options(warn = -1)
library(methods)
library(jsonlite)

source('r_scripts/helpers.R')
source('r_scripts/min_degree_helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
pValue <- settings$pValue
fileName <- settings$fileName
path <- settings$path
filterType <- settings$filterType

topFilterAmount <- settings$topFilterAmount
minFilterAmount <- settings$minFilterAmount

degrees <- readFileWithValidation(paste(path, fileName, sep=""))	

if (filterType == 'top') {
	if (!is.integer(topFilterAmount) || (topFilterAmount < 1 || topFilterAmount > length(degrees[[1]]))) {
		printMessageAndQuit(paste("Top amount specified is incorrect. Please specify a positive integer smaller than: ",  length(degrees[[1]]), sep=" "))
	}
} else if (filterType == 'min') {
	if (!is.integer(minFilterAmount) || (minFilterAmount < 0 || minFilterAmount > max(c(degrees[[1]], degrees[[2]])))) {
		printMessageAndQuit(paste("Min degree specified is incorrect. Please specify a positive integer smaller than: ",  max(c(degrees[[1]], degrees[[2]])), sep=" "))
	}
} else if (filterType == "both") {
	if (!is.integer(minFilterAmount) || (minFilterAmount < 0 || minFilterAmount > max(c(degrees[[1]], degrees[[2]])))
		|| !is.integer(topFilterAmount) || (topFilterAmount < 1 || topFilterAmount > length(degrees[[1]]))) {
		printMessageAndQuit("One of the filter values was out of bounds. Please try another filter value.")	
	}
}

result <- getGenesBothFilters(degrees, filterType, topFilterAmount, minFilterAmount)
output <- list(rowDegrees = result$row, rowNames = names(result$row), colDegrees = result$col, colNames = names(result$col))
cat(format(toJSON(output, auto_unbox = TRUE)))