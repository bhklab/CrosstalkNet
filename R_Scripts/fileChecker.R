library(jsonlite)
library(Matrix)

source('R_Scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
fileName <- settings$fileName
filePath <- settings$filePath

write('fileName:', stderr())
write(fileName, stderr())
write('filePath:', stderr())
write(filePath, stderr())

corMatrix <- c()
tryCatch(corMatrix <- readRDS(paste(filePath, fileName, sep="")),
           error = function(cond) {cat(format(toJSON(list(status = 1, message = "Failed to read the uploaded file. Please make sure that it is an RData file containing a matrix."), auto_unbox = TRUE))) ; write(paste("failed read", cond, sep=""), stderr()); quit()}) 

write("nrow", stderr())
write(nrow(corMatrix), stderr())
write("ncol", stderr())
write(ncol(corMatrix), stderr())
rowNames <- rownames(corMatrix)
colNames <- colnames(corMatrix)

if (!is.na(rowNames) && !is.na(colNames) && all(rowNames == colNames)) {		
	corMatrix <- appendSideToMatrixNames(corMatrix, 'E', 'row')
	corMatrix <- appendSideToMatrixNames(corMatrix, 'S', 'col')
	ptm <- proc.time()
	degrees <- getDegrees(corMatrix)

	timeDif <- proc.time() - ptm 
	write("getting degrees took: ", stderr())
	write(timeDif, stderr())
	
	saveRDS(corMatrix, paste(filePath, fileName, sep=""))
	saveRDS(degrees, paste(filePath, "degrees", fileName, sep=""))
	cat(format(toJSON(list(status = 0, message = "File upload successful! You can now choose your file from the dropdown."), auto_unbox = TRUE)))

} else {
	#file.remove(paste(filePath, fileName, sep=""))
	cat(format(toJSON(list(status = 1, message = "File upload failed. Row names and column names don't match"), auto_unbox = TRUE)))	
}




