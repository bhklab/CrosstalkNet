library(jsonlite)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')
epiStromaFlag <- TRUE
# args <- commandArgs(trailingOnly = TRUE)
# pValue <- args[2]
# numberOfNeighbours <- as.numeric(args[3])
# selectedGenes <- c()



# for (i in 1: numberOfNeighbours) {
#     selectedGenes <- c(selectedGenes, as.character(args[3 + i]))
# }
pValue <- '05'
selectedGenes = c('VPS72-E', 'UBE2C-S', 'TBP-E', 'CDC45-S')

firstHalf <- selectedGenes[seq(from = 1, to = length(selectedGenes), by = 2)]

if (length(selectedGenes) > 1) {
    secondHalf <- selectedGenes[seq(from = 2, to = length(selectedGenes), by = 2)]
}


#
write(paste(first, second, side, pValue), stderr())
corMatrix <- dget(paste('corMatrix.', pValue, ".R", sep = ""))
degrees <- dget(paste('degrees.', pValue, ".R", sep = ""))

weights <- c()
exclusions <- list()
neighbours <- list()
resultDegrees <- list()

for (i in 1: length(selectedGenes)) {
    exclusions = getExclusions(exclusions, i, selectedGenes)
    neighbours[[i]] = getNeighbourNames(corMatrix, selectedGenes[i], exclusions[[i]])
    resultDegrees[[i]] = getDegreesForNeighbourNames(degrees, neighbours[[i]])
}

if (epiStromaFlag == TRUE) {
    if ((tolower(substr(selectedGenes[1], nchar(selectedGenes[1]) - 1, nchar(selectedGenes[1]))) == '-e')) {
        epiSelected <- firstHalf
        epiNeighbours <- list()

        if (length(neighbours) > 1) {
            epiNeighbours <- neighbours[seq(from = 2, to = length(neighbours), by = 2)]
        }

        stromaSelected <- secondHalf
        stromaNeighbours <- list()
        if (length(neighbours) > 0) {
            stromaNeighbours <- neighbours[seq(from = 1, to = length(neighbours), by = 2)]
        }

        epiIndex <- c(epiSelected, unlist(epiNeighbours))
        stromaIndex <- c(stromaSelected, unlist(stromaNeighbours))

    } else {
    	epiSelected <- secondHalf
        epiNeighbours <- list()

        if (length(neighbours) > 1) {
            epiNeighbours <- neighbours[seq(from = 1, to = length(neighbours), by = 2)]
        }

        stromaSelected <- firstHalf
        stromaNeighbours <- list()
        if (length(neighbours) > 0) {
            stromaNeighbours <- neighbours[seq(from = 2, to = length(neighbours), by = 2)]
        }

        epiIndex <- c(epiSelected, unlist(epiNeighbours))
        stromaIndex <- c(stromaSelected, unlist(stromaNeighbours))
    }

    weights <- corMatrix[unique(epiIndex), unique(stromaIndex)]
    weights[-which(rownames(weights) %in% epiSelected), -which(colnames(weights) %in% stromaSelected)] = 0
}

result <- list(degrees = resultDegrees, weights = weights)
cat(format(serializeJSON(result)))
