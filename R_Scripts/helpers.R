source('dataModels.R')
library(Matrix)

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

filterCorrelationsByWeight <- function(weights, minNegativeWeight, minPositiveWeight) {
    if (is.na(minNegativeWeight)|| is.nan(minNegativeWeight)) {
        weights[weights < 0] = 0
        minNegativeWeight <- 0
    } 

    if (is.na(minPositiveWeight) || is.nan(minPositiveWeight)) {
        weights[weights > 0] = 0
        minPositiveWeight <- 0
    }

    weights[weights > minNegativeWeight & weights < 0] = 0      
    weights[weights < minPositiveWeight & weights > 0] = 0  

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

#Say that we are calling this function in order to obtain second neighbours. Say that the first node 
#we selected in the dropdown was A, then the node we selected in the second dropdown was F. The exclusion will be
#A since we don't want to duplicate A in the third panel. 
getNeighbours <- function(corMatrix, gene, exclusion) {
    #write('Gene: ', stderr())
    #write(gene, stderr())
    #write('exclusions: ', stderr())
    #write(exclusion, stderr())
    if (tolower(substr(gene, nchar(gene)-1, nchar(gene))) == '-e') {
        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
        neighboursNames <- setdiff(neighboursNames, exclusion)

        neighbours <- corMatrix[gene, neighboursNames]
        names(neighbours) <- neighboursNames#names(corMatrix[gene, neighboursNames])

                #write('neighbours: ', stderr())
        #write(neighbours, stderr())
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
    #write('first: ', stderr())
    #write(first, stderr())

    if (length(neighbours) < 1) {
        return(integer())
    }

    if (tolower(substr(first, nchar(first)-1, nchar(first))) == '-e') {
        resultDegrees <- degrees$epiDegree[names(neighbours)]
    } else {
        resultDegrees <- degrees$stromaDegree[names(neighbours)]
                        #write('neighbours: ', stderr())
        #write(neighbours, stderr())
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
    if (length(gene) == 0 || is.na(gene)) {
        return(character())
    }

    if (tolower(substr(gene, nchar(gene)-1, nchar(gene))) == '-e') {
        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
    } else {
        neighboursNames <- names(which(corMatrix[, gene] != 0))
    }

    neighboursNames <- setdiff(neighboursNames, exclusion)
    neighboursNames
}

getDegreesForNeighbourNames <- function(degrees, neighbourNames) {
    first <- neighbourNames[1]
    # #write('first: ', stderr())
    # #write(first, stderr())

    if (length(neighbourNames) < 1 || is.na(first)) {
        return(integer())
    }

    if (tolower(substr(first, nchar(first)-1, nchar(first))) == '-e') {
        resultDegrees <- degrees$epiDegree[na.omit(neighbourNames)]
    } else {
        resultDegrees <- degrees$stromaDegree[na.omit(neighbourNames)]
    }

    resultDegrees
}

createEdgesDF <- function(corMatrix, gene, exclusion, limit) {
    edges <- createEmptyEdges()

    if (length(gene) == 0 || is.na(gene)) {
        return(edges)
    }

    if (tolower(substr(gene, nchar(gene)-1, nchar(gene))) == '-e') {
        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
        neighboursNames <- setdiff(neighboursNames, exclusion)
        

        neighbours <- corMatrix[gene, neighboursNames]
        names(neighbours) <- neighboursNames#names(corMatrix[gene, neighboursNames])
    } else {
        neighboursNames <- names(which(corMatrix[, gene] != 0))
        neighboursNames <- setdiff(neighboursNames, exclusion)

        neighbours <- corMatrix[neighboursNames, gene]
        names(neighbours) <- neighboursNames#names(corMatrix[neighboursNames , gene])
    }

    if (length(neighbours) == 0) {
        return(edges)
    }

    if (limit > 0) {
        neighbours <-  tail(sort(abs(neighbours)), limit)
    }
    
    for (i in 1:length(neighbours)) {       
        edges[i, "source"] <- gene
        edges[i, "target"] <- names(neighbours[i])
        edges[i, "weight"] <- neighbours[i]
    }

    edges
}

getNeighboursNodes <- function(corMatrix, degrees, gene, exclusion, level, selectedGenes) {
    neighboursNames <- getNeighbourNames(corMatrix, gene, exclusion)
    neighboursDegrees <- getDegreesForNeighbourNames(degrees, neighboursNames)
    nodes <- createEmptyNodes()

    if (length(neighboursNames) < 1) {
        return(nodes)
    }

    for (i in 1:length(neighboursNames)) {
        #write("name", stderr())
        nodes[i, "name"] <- neighboursNames[i]
        #write("degree", stderr())
        nodes[i, "degree"] <- neighboursDegrees[i]
        #write("level", stderr())
        nodes[i, "level"] <- level

        if (nodes[i, "name"] %in% selectedGenes) {
            nodes[i, "isSource"] <- TRUE 
        } else {
            nodes[i, "isSource"] <- FALSE
        }
    }

    nodes
}

getNeighboursNodesFromEdges <- function(corMatrix, degrees, edges, level, selectedGenes, exclusion) {
    nodes <- createEmptyNodes()
    neighboursNames <- edges$target
    neighboursNames <- setdiff(neighboursNames, exclusion)
    neighboursDegrees <- getDegreesForNeighbourNames(degrees, edges$target)

    if (length(neighboursNames) < 1) {
        return(nodes)
    }

    for (i in 1:length(neighboursNames)) {
        #write("name", stderr())
        nodes[i, "name"] <- neighboursNames[i]
        #write("degree", stderr())
        nodes[i, "degree"] <- neighboursDegrees[i]
        #write("level", stderr())
        nodes[i, "level"] <- level

        if (nodes[i, "name"] %in% selectedGenes) {
            nodes[i, "isSource"] <- TRUE 
        } else {
            nodes[i, "isSource"] <- FALSE
        }
    }

    nodes
}

getGeneSuffix <- function(gene) {
    tolower(substr(gene, nchar(gene)-1, nchar(gene)))
}

filterEdgesByWeight <- function(edges, minNegativeWeight, minPositiveWeight) {
    if (is.na(minNegativeWeight)|| is.nan(minNegativeWeight)) {
        temp <- -which(edges$weight < 0)
        if (length(temp) > 0) {
            edges <- edges[temp,]        
        }  
        
        
        write("minNegativeWeight!!!!!!!!!!", stderr())
        minNegativeWeight <- 0
    } 

    if (is.na(minPositiveWeight) || is.nan(minPositiveWeight)) {
        temp <- -which(edges$weight > 0)
        if (length(temp) > 0) {
            edges <- edges[temp,]        
        }

        
        write("minPositiveWeight!!!!!!!!!!", stderr())
        minPositiveWeight <- 0
    }

    temp <- -which(edges$weight >= minNegativeWeight & edges$weight < 0)
    if (length(temp) > 0) {
        edges <- edges[temp,]        
    }
    

    temp <- -which(edges$weight <= minPositiveWeight & edges$weight > 0)
    if (length(temp) > 0) {
        edges <- edges[temp, ]                
    }

    edges
}

getMinMaxWeightValues <- function(weights) {
    minPositiveWeight <- min(weights[weights > 0])
    maxPositiveWeight <- max(weights[weights > 0])

    minNegativeWeight <- min(weights[weights < 0])
    maxNegativeWeight <- max(weights[weights < 0])

    if (is.na(minPositiveWeight) || is.nan(minPositiveWeight) || is.infinite(minPositiveWeight)) { minPositiveWeight = 0 }
    if (is.na(maxPositiveWeight) || is.nan(maxPositiveWeight) || is.infinite(maxPositiveWeight)) { maxPositiveWeight = 1 }

    if (is.na(minNegativeWeight) || is.nan(minNegativeWeight) || is.infinite(minNegativeWeight)) { minNegativeWeight = -1 }
    if (is.na(maxNegativeWeight) || is.nan(maxNegativeWeight) || is.infinite(maxNegativeWeight)) { maxNegativeWeight = 0 }

    result <- list(minPositiveWeight = minPositiveWeight, maxPositiveWeight = maxPositiveWeight, minNegativeWeight = minNegativeWeight, maxNegativeWeight = maxNegativeWeight)
    result
}
    