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
filterAmount <- settings$filterAmount

degrees <- readFileWithValidation(paste(path, fileName, sep=""))	

if (filterType == 'top') {
	if (!is.integer(filterAmount) || (filterAmount < 1 || filterAmount > length(degrees$epiDegree))) {
		printMessageAndQuit(paste("Top amount specified is incorrect. Please specify a positive integer smaller than: ",  length(degrees$epiDegree), sep=" "))
	}

	result <- getTopGenesByDegree(degrees, filterAmount)
} else if (filterType == 'min') {
	if (!is.integer(filterAmount) || (filterAmount < 0 || filterAmount > max(c(degrees$epiDegree, degrees$stromaDegree)))) {
		printMessageAndQuit(paste("Min degree specified is incorrect. Please specify a positive integer smaller than: ",  max(c(degrees$epiDegree, degrees$stromaDegree)), sep=" "))
	}

	result <- getGenesWithMinDegree(degrees, filterAmount)
}

output <- list(epiDegrees = result$epi, epiGeneNames = names(result$epi), stromaDegrees = result$stroma, stromaGeneNames = names(result$stroma))
cat(format(toJSON(output, auto_unbox = TRUE)))