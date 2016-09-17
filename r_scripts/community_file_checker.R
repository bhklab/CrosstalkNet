library(jsonlite)
library(Matrix)

source('r_scripts/helpers.R')

args <- commandArgs(trailingOnly = TRUE)
settings <- fromJSON(args[2])
fileName <- settings$fileName
filePath <- settings$filePath

write('fileName:', stderr())
write(fileName, stderr())
write('filePath:', stderr())
write(filePath, stderr())

communityInteractions <- c()
tryCatch(communityInteractions <- readRDS(paste(filePath, fileName, sep="")),
           error = function(cond) {printMessageAndQuit("Failed to read the uploaded file. Please make sure that it is an RData file containing a data table.")}) 

# Checks to see if the read object is a dgCMatrix
if (class(communityInteractions) != 'data.frame') {
	printMessageAndQuit("The specified file is not a data.frame.")
}

if (colnames(communityInteractions) 
	!= c("epi", "stroma", "interaction", "epiCommunity", "stromaCommunity")) {
	printMessageAndQuit("The column names of the data.frame aren't correct. 
		Please set them to: epi, stroma, interaction, epiCommunity, stromaCommunity.")	
}

if (anyNA(communityInteractions)) {
	# Prints an error if there exist any NA's in the dgCMatrix
	printMessageAndQuit("The uploaded file contains NA's. Please remove them and try again")
} else if (class(communityInteractions$epi) != "character" || class(communityInteractions$stroma) != "character" ||
		class(communityInteractions$interaction) != "numeric" || class(communityInteractions$epiCommunity) != "numeric" ||
		class(communityInteractions$stromaCommunity) != "numeric") {
	printMessageAndQuit("The columns of the data.frame don't contain the necessary data types.")
} else {		
	printMessageAndQuit("File upload successful! You can now choose your file from the dropdown.", status = 0)

}




