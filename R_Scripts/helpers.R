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