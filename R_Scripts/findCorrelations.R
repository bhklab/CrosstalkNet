library(jsonlite)

setwd('C:/Users/Alex/Documents/angular-seed/R_Scripts')
corMatrix <- dget('corMatrix.R')

args <- commandArgs(trailingOnly = TRUE)
gene <- args[2]
side <- args[3]

#gene	
#side

if (side == 'epi') {
	cat(format(serializeJSON(corMatrix[gene, which(corMatrix[gene, ] != 0)])))
}
else {
	cat(format(serializeJSON(corMatrix[which(corMatrix[gene, ] != 0), gene])))
}