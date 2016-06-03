library(jsonlite)

setwd('R_Scripts')
source('helpers.R')
setwd('User_Matrices')

args <- commandArgs(trailingOnly = TRUE)
fileName <- args[2]

write('fileName:', stderr())
write(fileName, stderr())

corMatrix <- c()
tryCatch(corMatrix <- readRDS(fileName),
           error = function(cond) {cat(format(serializeJSON(list(returnCode = 1, message = "Failed to read the uploaded file. Please make sure that it is an RData file containing a matrix.")))) ; write("failed read", stderr()); file.remove(fileName); quit()}) 

rowNames <- rownames(corMatrix)
colNames <- colnames(corMatrix)

write('passed rowNames', stderr())
write('rowNames', stderr())
write(rowNames, stderr())
write('colNames', stderr())
write(colNames, stderr())

if (!is.na(rowNames) && !is.na(colNames) && all(rowNames == colNames)) {
	write('if:', stderr())
		
	corMatrix <- appendSideToMatrixNames(corMatrix, 'E', 'row')
	corMatrix <- appendSideToMatrixNames(corMatrix, 'S', 'col')
	degrees <- getDegrees(corMatrix);
	saveRDS(corMatrix, fileName)
	saveRDS(degrees, paste("degrees", fileName, sep=""))
	cat(format(serializeJSON(list(returnCode = 0, message = "File upload successful! You can now choose your file from the dropdown."))))

} else {
	write('else:', stderr())
	file.remove(fileName)
	cat(format(serializeJSON(list(returnCode = 1, message = "File upload failed. Row names and column names don't match"))))	
}




