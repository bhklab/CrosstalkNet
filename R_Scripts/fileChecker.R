library(jsonlite)

setwd('R_Scripts')
source('helpers.R')
setwd('User_Matrices')

args <- commandArgs(trailingOnly = TRUE)
fileName <- args[2]

write('fileName:', stderr())
write(fileName, stderr())

corMatrix <- c()
result <- list(returnCode = c(1,2), message = c(3,4))
tryCatch(corMatrix <- readRDS(fileName),
           error = function(cond) {cat(format(serializeJSON(cond))) ; write("failed read", stderr()); file.remove(fileName); quit()}) 

rowNames <- rownames(corMatrix)
colNames <- colnames(corMatrix)

write('passed rowNames', stderr())
write('rowNames', stderr())
write(rowNames, stderr())
write('colNames', stderr())
write(colNames, stderr())

if (!is.null(rowNames) && !is.null(colNames) && all(rowNames == colNames)) {
	write('if:', stderr())
	cat(format(serializeJSON(list(returnCode = 0, message = "Good to go"))))	
	corMatrix <- appendSideToMatrixNames(corMatrix, 'E', 'row')
	corMatrix <- appendSideToMatrixNames(corMatrix, 'S', 'col')
	degrees <- getDegrees(corMatrix);
	saveRDS(corMatrix, fileName)
	saveRDS(degrees, paste("degrees", fileName, sep="")

} else {
	write('else:', stderr())
	cat(format(serializeJSON(list(returnCode = 1, message = "Row names and column names don't match"))))	
	file.remove(fileName)
}




