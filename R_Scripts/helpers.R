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
        rownames(corMatrix) <- toupper(paste(rownames(corMatrix), side, sep="-"))
    } else {
        colnames(corMatrix) <- toupper(paste(colnames(corMatrix), side, sep="-"))
    }

    corMatrix
}

#methods for new and standard approach of creating graphs
getNeighbourNames <- function(corMatrix, gene, exclusion) {
    if (length(gene) == 0 || is.na(gene)) {
        return(character())
    }

    if (getGeneSuffix(gene) == '-e') {
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

    if (getGeneSuffix(first) == '-e') {
        resultDegrees <- degrees$epiDegree[na.omit(neighbourNames)]
    } else {
        resultDegrees <- degrees$stromaDegree[na.omit(neighbourNames)]
    }

    resultDegrees
}

createEdgesDF <- function(corMatrix, gene, exclusion, limit) {
    edges <- createEmptyEdges(0)

    if (length(gene) == 0 || is.na(gene)) {
        return(edges)
    }

    if (getGeneSuffix(gene) == '-e') {
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
        #neighbours <- tail(sort(abs(neighbours)), limit)
    }

    edges <- createEmptyEdges(length(neighbours))
    
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
    nodes <- createEmptyNodes(length(neighboursNames))

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
    neighboursNames <- edges$target
    neighboursNames <- setdiff(neighboursNames, exclusion)
    neighboursDegrees <- getDegreesForNeighbourNames(degrees, neighboursNames)
    nodes <- createEmptyNodes(length(neighboursNames))

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
        
        minNegativeWeight <- 0
    } 

    if (is.na(minPositiveWeight) || is.nan(minPositiveWeight)) {
        temp <- -which(edges$weight > 0)
        if (length(temp) > 0) {
            edges <- edges[temp,]        
        }

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
getNeighbours <- function(corMatrix, gene, exclusion) {
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

    neighbours
}