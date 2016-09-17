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
    topEpi <- degrees$epiDegree[1:top]
    names(topEpi) <- names(degrees$epiDegree[1:top])
    topStroma <- degrees$stromaDegree[1:top]
    names(topStroma) <- names(degrees$stromaDegree[1:top])

    result <- list(epi = topEpi, stroma = topStroma)
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
    epiIndex <- which(degrees$epiDegree >= minDegree)
    minEpi <- degrees$epiDegree[epiIndex]
    names(minEpi) <- names(degrees$epiDegree[epiIndex])

    stromaIndex <- which(degrees$stromaDegree >= minDegree)
    minStroma <- degrees$stromaDegree[stromaIndex]
    names(minStroma) <- names(degrees$stromaDegree[stromaIndex])

    result <- list(epi = minEpi, stroma = minStroma)
}