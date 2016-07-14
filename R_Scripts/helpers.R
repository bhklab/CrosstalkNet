source('R_Scripts/dataModels.R')
library(Matrix)

readMatricesFromFiles <- function(normalFile, tumorFile, deltaFile) {
    # Creates a list of matrices by reading in specified files
    #
    # Args:
    #   normalFile: The normal tissue correlation matrix file path.
    #   tumorFile: The tumor tissue correlation matrix file path.
    #   deltaFile: The delta correlation matrix file path.
    #
    # Returns:
    #   A list of matrices based on the file paths specified. The file path
    #   should be NULL if that particular matrix type is not desired in 
    #   the list. 
    corMatrices <- list()

    if (!is.null(normalFile)) {
        corMatrixNormal <- readFileWithValidation(normalFile)
        corMatrices[["normal"]] = corMatrixNormal;
    }

    if (!is.null(tumorFile)) {
        corMatrixTumor <- readFileWithValidation(tumorFile)
        corMatrices[["tumor"]] = corMatrixTumor;
    }

    if (!is.null(deltaFile)) {
        corMatrixDelta <- readFileWithValidation(deltaFile)
        corMatrices[["delta"]] = corMatrixDelta;
    }

    corMatrices
}

getDegrees <- function(corMatrix) {
    # Computes the degrees of the genes for a given correlation matrix.
    #
    # Args:
    #   corMatrix: The correlation matrix for which to compute the degrees.
    #
    # Returns:
    #   A list of epi gene degrees and stroma gene degrees accessed by
    #   epiDegree and stromaDegree respectively. It is assumed that epi genes
    #   are the rownames and stroma genes are the colnames in the matrix.
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

appendSideToMatrixNames <- function(corMatrix, side, rowOrCol) {
    # Appends a given string to the rownames or colnames of a matrix.
    #
    # Args:
    #   corMatrix: The matrix that will have side appended to its rownames
    #               or colnames.
    #   side: The string to be appended.
    #   rowOrCol: An indicator that selects whether rownames or colnames
    #               will be appended to. If 'row' appends to row, else
    #               appends to column.
    #
    # Returns: The given corMatrix with either its rownames or colnames
    #           having side appended to them.
    if (rowOrCol == 'row') {
        rownames(corMatrix) <- toupper(paste(rownames(corMatrix), side, sep="-"))
    } else {
        colnames(corMatrix) <- toupper(paste(colnames(corMatrix), side, sep="-"))
    }

    corMatrix
}

#methods for new and standard approach of creating graphs
getNeighbourNames <- function(corMatrix, gene, exclusions) {
    # Obtains a list of neighbour names for the specified gene, in the
    # correlation matrix, that are not in exclusions.
    #
    # Args:
    #   corMatrix: The correlation matrix to be used.
    #   gene: The gene for which to obtain the neighbour names.
    #   exclusions: A vector containing gene names that should not be
    #               returned as part of the neighbour names
    #
    # Returns: A vector containing the gene names of the neighbours of
    #           gene. This vector does not contain the names specfied 
    #           in exclusions.
    if (length(gene) == 0 || is.na(gene)) {
        return(character())
    }

    if (getGeneSuffix(gene) == '-e') {
        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
    } else {
        neighboursNames <- names(which(corMatrix[, gene] != 0))
    }

    neighboursNames <- setdiff(neighboursNames, exclusions)
    neighboursNames
}

getDegreesForGenes <- function(degrees, genes) {
    # Obtains a vector of degrees for the specified genes using the 
    # given list of degrees.
    #
    # Args:
    #   degrees: The list of degrees that will be indexed into
    #   genes: The genes for which to obtain the degrees.
    #
    # Returns: A vector containing the degrees of the specified genes.
    first <- genes[1]
    # #write('first: ', stderr())
    # #write(first, stderr())

    if (length(genes) < 1 || is.na(first)) {
        return(integer())
    }

    if (getGeneSuffix(first) == '-e') {
        resultDegrees <- degrees$epiDegree[na.omit(genes)]
    } else {
        resultDegrees <- degrees$stromaDegree[na.omit(genes)]
    }

    resultDegrees
}
createEdgesDFDelta <- function(corMatrices, gene, exclusion, limit, networkType) {
    edges <- createEmptyDifferentialEdges(0)
    neighbours <- list(normal = NULL, tumor = NULL, delta = NULL)

    if (getGeneSuffix(gene) == '-e') {
        checkGeneInGeneNames(gene, rownames(corMatrices[[networkType]]))

        neighboursNames <- names(which(corMatrices[[networkType]][gene, ] != 0)) 
        neighboursNames <- setdiff(neighboursNames, exclusion)

        for (i in names(corMatrices)) {
            neighbours[[i]] = corMatrices[[i]][gene, neighboursNames]
            names(neighbours[[i]]) <- neighboursNames#names(corMatrix[gene, neighboursNames])
        }
    } else {
        checkGeneInGeneNames(gene, colnames(corMatrices[[networkType]]))

        neighboursNames <- names(which(corMatrices[[networkType]][, gene] != 0)) 
        neighboursNames <- setdiff(neighboursNames, exclusion)

        for (i in names(corMatrices)) {
            neighbours[[i]] = corMatrices[[i]][neighboursNames, gene]
            names(neighbours[[i]]) <- neighboursNames#names(corMatrix[gene, neighboursNames])
        }
    }

    if (length(neighbours[[networkType]]) == 0) {
        return(edges)
    }

    if (limit > 0) {
        #neighbours <- tail(sort(abs(neighbours)), limit)
    }

    edges <- createEmptyDifferentialEdges(length(neighbours[[networkType]]))
    
    if (!is.null(neighbours$delta)) {
        iterator <- length(neighbours$delta)
    } else if (!is.null(neighbours$normal)) {
        iterator <- length(neighbours$normal)
    } else {
        iterator <- length(neighbours$tumor)
    }



    for (i in 1:iterator) {       
        edges[i, "source"] <- gene
        edges[i, "target"] <- names(neighbours[[networkType]][i])
        edges[i, "weight"] <- neighbours[[networkType]][i]
        if (networkType == 'delta') {        
            edges[i, "normal"] <- neighbours$normal[i]
            edges[i, "tumor"] <- neighbours$tumor[i]   
        }
    }

    edges
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
    if (length(gene) == 0 || is.na(gene) || is.null(gene)) {
        printErrorAndQuit("Could not find gene in matrix")
    }

    tolower(substr(gene, nchar(gene)-1, nchar(gene)))
}

filterEdgesByWeight <- function(edges, minNegativeWeight, minPositiveWeight) {
    # Filters a data frame of cytoscape edges by minimum negative weight and minimum positive weight.
    #
    # Args:
    #   edges: The data frame of cytoscapes edges to filter.
    #   minNegativeWeight: The minimum magnitude that negative edges should have.
    #   minPositiveValue: The minimum magnitude that positive edges should have. 
    #
    # Returns:
    #   A filtered data frame of cytoscape edges.
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
    if (getGeneSuffix(gene) == '-e') {
        checkGeneInGeneNames(gene, rownames(    corMatrix))

        neighboursNames <- names(which(corMatrix[gene, ] != 0)) 
        neighboursNames <- setdiff(neighboursNames, exclusion)

        neighbours <- corMatrix[gene, neighboursNames]
        names(neighbours) <- neighboursNames#names(corMatrix[gene, neighboursNames])
    } else {
        checkGeneInGeneNames(gene, colnames(corMatrix))

        neighboursNames <- names(which(corMatrix[, gene] != 0))
        neighboursNames <- setdiff(neighboursNames, exclusion)

        neighbours <- corMatrix[neighboursNames, gene]
        names(neighbours) <- neighboursNames#names(corMatrix[neighboursNames , gene])
    }

    neighbours
}

checkGeneInGeneNames <- function(gene, geneNames) {
    if (is.na(gene) || is.null(gene) || (!gene %in% geneNames)) {
        printErrorAndQuit(paste("Could not find gene:", gene, "in matrix"))
    }
}

printErrorAndQuit <- function(error) {
    write(error, stderr())
    cat(format(toJSON(list(status = 1, message = error), auto_unbox = TRUE)))
    quit()
}

readFileWithValidation <- function(fileName) {
    tryCatch(fileResult <- readRDS(fileName),
        error = function(cond) {cat(format(toJSON(list(status = 1, message = "Failed to read one or more files. Please make sure that it is an RData file containing a matrix."), auto_unbox = TRUE))) ; write(paste("failed read", cond, sep=""), stderr()); quit()}) 

    fileResult
}