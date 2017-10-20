getTopGenesByDegree <- function(degrees, top) {
    # Obtains the genes having the highest degree for a 
    # given list of degrees. 
    #
    # Args:
    #   degrees: The list of degrees to be used.
    #   top: An integer specifying how many of the top
    #   genes should be returned.
    #
    # Returns: 
    #   A list of degrees containing only the top number of genes.
    topRow <- degrees[[1]][1:top]
    names(topRow) <- names(degrees[[1]][1:top])
    topCol <- degrees[[2]][1:top]
    names(topCol) <- names(degrees[[2]][1:top])

    result <- list(row = topRow, col = topCol)
}

getGenesWithMinDegree <- function(degrees, minDegree) {
    # Obtains the genes with degreee minDegree or higher
    # for a given list of degrees.
    # 
    # Args:
    #   degrees: The list of degrees to be used.
    #   minDegree: An integer specifying the min
    #   degree of the genes to be returned.
    #
    # Returns:
    #   A list of degrees containing only the genes with a degree
    # of minDegree or higher.
    rowIndex <- which(degrees[[1]] >= minDegree)
    minRow <- degrees[[1]][rowIndex]
    names(minRow) <- names(degrees[[1]][rowIndex])

    colIndex <- which(degrees[[2]] >= minDegree)
    minCol <- degrees[[2]][colIndex]
    names(minCol) <- names(degrees[[2]][colIndex])

    result <- list(row = minRow, col = minCol)
}

getGenesBothFilters <- function(degrees, filterType, top, minDegree) {
    minRowIndex <- which(degrees[[1]] >= minDegree)
    minRow <- degrees[[1]][minRowIndex]
    names(minRow) <- names(degrees[[1]][minRowIndex])

    topRow <- degrees[[1]][1:top]
    names(topRow) <- names(degrees[[1]][1:top])

    rowTotal <- c(minRow, topRow)
    rowTotal <- rowTotal[!duplicated(names(rowTotal))]

    minColIndex <- which(degrees[[2]] >= minDegree)
    minCol <- degrees[[2]][minColIndex]
    names(minCol) <- names(degrees[[2]][minColIndex])

    topCol <- degrees[[2]][1:top]
    names(topCol) <- names(degrees[[2]][1:top])

    colTotal <- c(minCol, topCol)
    colTotal <- colTotal[!duplicated(names(colTotal))]

    if (filterType == "min") {
        rowTotal <- rowTotal[names(minRow)]
        colTotal <- colTotal[names(minCol)]
    } else if (filterType == "top") {
        rowTotal <- rowTotal[names(topRow)]
        colTotal <- colTotal[names(topCol)]
    } else if (filterType == "both") {
        rowTotal <- rowTotal[intersect(names(minRow), names(topRow))]
        colTotal <- colTotal[intersect(names(minCol), names(topCol))]
    }

    result <- list(row = rowTotal, col = colTotal)
}