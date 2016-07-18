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
           error = function(cond) {printMessageAndQuit("Failed to read the uploaded file. Please make sure that it is an RData file containing a matrix.")}) 

# Checks to see if the read object is a dgCMatrix
if (class(corMatrix) != 'dgCMatrix') {
	printMessageAndQuit("The specified file is not a dgCMatrix.")
}

write("nrow", stderr())
write(nrow(corMatrix), stderr())
write("ncol", stderr())
write(ncol(corMatrix), stderr())
rowNames <- rownames(corMatrix)
colNames <- colnames(corMatrix)

if (anyNA(corMatrix)) {
	# Prints an error if there exist any NA's in the dgCMatrix
	printMessageAndQuit("The uploaded file contains NA's. Please remove them and try again")
} else if (!anyNA(rowNames) && !anyNA(colNames) && all(rowNames == colNames)) {		
	corMatrix <- appendSideToMatrixNames(corMatrix, 'E', 'row')
	corMatrix <- appendSideToMatrixNames(corMatrix, 'S', 'col')
	ptm <- proc.time()
	degrees <- getDegrees(corMatrix)

	timeDif <- proc.time() - ptm 
	write("getting degrees took: ", stderr())
	write(timeDif, stderr())
	
	saveRDS(corMatrix, paste(filePath, fileName, sep=""))
	saveRDS(degrees, paste(filePath, "degrees", fileName, sep=""))
	printMessageAndQuit("File upload successful! You can now choose your file from the dropdown.", status = 0)

} else {
	# Prints an error if the row names are not identical to the column names
	printMessageAndQuit("File upload failed. Row names and column names don't match")
}




