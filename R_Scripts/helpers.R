getDegrees <- function(corMatrix) {
    deg.row <- as.numeric() 
    for(k in 1:nrow(corMatrix)){
        deg.row[k] <- length(which(corMatrix[k,] != 0))
    }
    #dim(deg.row) <- length(deg.row)
    names(deg.row) <- rownames(corMatrix)
    
    # cols
    deg.col <- as.numeric() 
    for(k in 1:ncol(corMatrix)){
        deg.col[k] <- length(which(corMatrix[,k] != 0))
    }
    #dim(deg.col) <- length(deg.col)
    names(deg.col) <- colnames(corMatrix)
    
    result <- list(epiDegree = deg.row, stromaDegree = deg.col)
}

removeUnnecessaryGenes <- function(corMatrix, epiDegrees, stromaDegrees) {
    result <- corMatrix
    indices <- c()

    for (index in 1:nrow(corMatrix)) {
        if (length(which(corMatrix[index,] == 0)) && length(which(corMatrix[, index] == 0))) {
            indices <- c(indices, index)
        }
    }

    result <- result[-indices, -indices]


    # for (index in 1:nrow(corMatrix)) {
    #     if (epiDegrees[index] == 0 && stromaDegrees[index] == 0) {
    #         result <- result[, -index]
    #         result <- result[-index, ]
    #     }
    # }
    
    result
}

filterCorrelationsByWeight <- function(weights, minNegativeWeight, minPositiveWeight) {
    if (is.na(minNegativeWeight)|| is.nan(minNegativeWeight)) {
        weights[weights < 0] = 0
        minNegativeWeight <- 0
    } 

    if (is.na(minPositiveWeight) || is.nan(minPositiveWeight)) {
        weights[weights > 0] = 0
        minPositiveWeight <- 0
    }

    weights[weights >= minNegativeWeight & weights < 0] = 0      
    weights[weights <= minPositiveWeight & weights > 0] = 0  

    weights
}

appendSideToMatrixNames <- function(corMatrix, side, rowOrCol) {
    if (rowOrCol == 'row') {
        rownames(corMatrix) <- paste(rownames(corMatrix), side, sep="-")
    } else {
        colnames(corMatrix) <- paste(colnames(corMatrix), side, sep="-")
    }

    corMatrix
}

determineSide <- function() {

}

#Say that we are calling this function in order to obtain second neighbours. Say that the first node 
#we selected in the dropdown was A, then the node we selected in the second dropdown was F. The exclusion will be
#A since we don't want to duplicate A in the third panel. 
getNeighbours <- function(corMatrix, gene, exclusion) {
    write('Gene: ', stderr())
    write(gene, stderr())
    write('exclusions: ', stderr())
    write(exclusion, stderr())
    if (tolower(substr(gene, nchar(gene)-1, nchar(gene))) == '-e') {
        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
        neighboursNames <- setdiff(neighboursNames, exclusion)

        neighbours <- corMatrix[gene, neighboursNames]
        names(neighbours) <- neighboursNames#names(corMatrix[gene, neighboursNames])

                write('neighbours: ', stderr())
        write(neighbours, stderr())
    } else {
        neighboursNames <- names(which(corMatrix[, gene] != 0))
        neighboursNames <- setdiff(neighboursNames, exclusion)

        neighbours <- corMatrix[neighboursNames, gene]
        names(neighbours) <- neighboursNames#names(corMatrix[neighboursNames , gene])
    }

    neighbours
}

getDegreesForNeighbours <- function(degrees, neighbours) {
    first <- names(neighbours[1])
    write('first: ', stderr())
    write(first, stderr())

    if (length(neighbours) < 1) {
        return(c(0))
    }

    if (tolower(substr(first, nchar(first)-1, nchar(first))) == '-e') {
        resultDegrees <- degrees$epiDegree[names(neighbours)]
    } else {
        resultDegrees <- degrees$stromaDegree[names(neighbours)]
                        write('neighbours: ', stderr())
        write(neighbours, stderr())
    }

    resultDegrees
}

getExclusions <- function(exclusions, i, selectedGenes) {
    if (i == 1) {
        exclusions[[i]] = c(NA)
    } else {
        index <- seq(from=i-1, to=1, by=-2)
        exclusions[[i]] = selectedGenes[index]
    }

    exclusions
}

#methods for new and standard approach of creating graphs
getNeighbourNames <- function(corMatrix, gene, exclusion) {
    write('Gene: ', stderr())
    write(gene, stderr())

    if (tolower(substr(gene, nchar(gene)-1, nchar(gene))) == '-e') {
        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
    } else {
        neighboursNames <- names(which(corMatrix[, gene] != 0))
    }
    neighboursNames <- setdiff(neighboursNames, exclusion)
    neighboursNames
}

getDegreesForNeighbourNames <- function(degrees, neighbourNames) {
    first <- neighbourNames
    write('first: ', stderr())
    write(first, stderr())

    if (length(neighbours) < 1) {
        return(c(0))
    }

    if (tolower(substr(first, nchar(first)-1, nchar(first))) == '-e') {
        resultDegrees <- degrees$epiDegree[neighbourNames]
    } else {
        resultDegrees <- degrees$stromaDegree[neighbourNames]
    }

    resultDegrees
}