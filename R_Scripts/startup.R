###########################################################################

# This code performs the network analysis on ER Neg
# paired Epi-Stroma Samples on the landmark genes (~ 978 genes) 
# a) Selfloop analysis using FDR adjustments

###########################################################################

source("http://bioconductor.org/biocLite.R")
biocLite(c("Biobase"))
biocLite("genefu")
library("Biobase")
library(gdata)
library(corrplot)
library(vcd)
library(org.Hs.eg.db)
require(limma)
require(psych)
require(caTools)
library(igraph)
library(xlsx)
library(stringi)
library(snow)

# Assuming all the objects are in the same folder for ER- subtype
#edataTE.ERNeg
#edataTS.ERNeg
#edataNE
#edataNS

load('TE-LGenes.RData')
load('TS-LGenes.RData')
CorTES.LGenes <- cor(t(edataTE.ERNeg.LGenes),t(edataTS.ERNeg.LGenes))

##################################
# Tumor epi-stroma network- 
# FDR correction
##################################

# FDR
TESLGenes.padj.FDR <- p.adjust(Signif.TESLGenes$p,method="fdr",length(Signif.TESLGenes$p)) # FDR Adjustment for multiple testing
CorTESLGenes.FDRadj <- CorTES.LGenes 
CorTESLGenes.FDRadj[TESLGenes.padj.FDR>0.05] <- 0 
length(which(diag(CorTESLGenes.FDRadj)!=0)) # Number of self loops
length(which((CorTESLGenes.FDRadj)!=0)) # Number of significant loops in the network





getDegree <- function(corMatrix) {
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
    for (index in 1:nrow(corMatrix)) {
        if (epiDegrees[index] == 0 && stromaDegrees[index] == 0) {
            corMatix <- corMatrix[-index, -index]
        }
    }
    
    corMatrix
}