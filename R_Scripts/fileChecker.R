library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts/User_Matrices')
args <- commandArgs(trailingOnly = TRUE)
fileName <- args[2]

tryCatch(corMatrix <- readRDS(fileName),
           warning = function(w) {cat(format(serializeJSON(w)))},
           error = function(e) {cat(format(serializeJSON(e)))}) 
rowNames <- rownames(corMatrix)
colNames <- colnames(corMatrix)

if (all(rowNames == colNames)) {
	cat(format(serializeJSON("Row and column names don't match")))
} 


cat(format(serializeJSON("Good to go")))