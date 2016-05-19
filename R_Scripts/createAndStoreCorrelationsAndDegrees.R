library(jsonlite)
library(psych)

setwd('C:/Users/alexp/Documents/EpiStroma/EpiStroma-webapp/R_Scripts')
source('helpers.R')

ptm <- proc.time()
load('TELGenes_GeneSym.RData')
load('TSLGenes_GeneSym.Rdata')

#load('esetTE_ERNeg.RData')
#load('esetTS_ERNeg.RData')
CorTES.LGenes <- cor(t(edataTE.ERNeg.LGenes),t(edataTS.ERNeg.LGenes))
#CorTES.LGenes <- CorTES.LGenes[1:100, 1:100]

Signif.TESLGenes<-r.test(54,CorTES.LGenes)
TESLGenes.padj.FDR <- p.adjust(Signif.TESLGenes$p,method="fdr",length(Signif.TESLGenes$p)) # FDR Adjustment for multiple testing
CorTESLGenes.FDRadj.001 <- CorTES.LGenes 
CorTESLGenes.FDRadj.01 <- CorTES.LGenes 
CorTESLGenes.FDRadj.05 <- CorTES.LGenes 
CorTESLGenes.FDRadj.1 <- CorTES.LGenes 

timeDif <- proc.time() - ptm 
write("Significance Test Took: ", stderr())
write(timeDif, stderr())

ptm <- proc.time()
CorTESLGenes.FDRadj.001[TESLGenes.padj.FDR>0.001] <- 0 
CorTESLGenes.FDRadj.01[TESLGenes.padj.FDR>0.01] <- 0 
CorTESLGenes.FDRadj.05[TESLGenes.padj.FDR>0.05] <- 0 
CorTESLGenes.FDRadj.1[TESLGenes.padj.FDR>0.1] <- 0

CorTESLGenes.FDRadj.001 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.001, 'E', 'row')
CorTESLGenes.FDRadj.001 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.001, 'S', 'col')

CorTESLGenes.FDRadj.01 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.01, 'E', 'row')
CorTESLGenes.FDRadj.01 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.01, 'S', 'col')

CorTESLGenes.FDRadj.05 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.05, 'E', 'row')
CorTESLGenes.FDRadj.05 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.05, 'S', 'col')

CorTESLGenes.FDRadj.1 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.1 , 'E', 'row')
CorTESLGenes.FDRadj.1 <- appendSideToMatrixNames(CorTESLGenes.FDRadj.1 , 'S', 'col')

timeDif <- proc.time() - ptm 
write("Overwriting Matrices With Zeros Took: ", stderr())
write(timeDif, stderr())

ptm <- proc.time()
degrees.001 <- getDegrees(CorTESLGenes.FDRadj.001)
degrees.01 <- getDegrees(CorTESLGenes.FDRadj.01)
degrees.05 <- getDegrees(CorTESLGenes.FDRadj.05)
degrees.1 <- getDegrees(CorTESLGenes.FDRadj.1)

timeDif <- proc.time() - ptm 
write("Calculating Degrees Took: ", stderr())
write(timeDif, stderr())

#CorTESLGenes.FDRadj.001 <- removeUnnecessaryGenes(CorTESLGenes.FDRadj.001, degrees.001$epiDegree, degrees.001$stromaDegree)
#CorTESLGenes.FDRadj.01 <- removeUnnecessaryGenes(CorTESLGenes.FDRadj.01, degrees.01$epiDegree, degrees.01$stromaDegree)
#CorTESLGenes.FDRadj.05 <- removeUnnecessaryGenes(CorTESLGenes.FDRadj.05, degrees.05$epiDegree, degrees.05$stromaDegree)
#CorTESLGenes.FDRadj.1 <- removeUnnecessaryGenes(CorTESLGenes.FDRadj.1, degrees.1$epiDegree, degrees.1$stromaDegree)
#degrees <- getDegrees(corMatrix)

ptm <- proc.time()
dput(CorTESLGenes.FDRadj.001, 'corMatrix.001.R')
dput(CorTESLGenes.FDRadj.01, 'corMatrix.01.R')
dput(CorTESLGenes.FDRadj.05, 'corMatrix.05.R')
dput(CorTESLGenes.FDRadj.1, 'corMatrix.1.R')

dput(degrees.001, 'degrees.001.R')
dput(degrees.01, 'degrees.01.R')
dput(degrees.05, 'degrees.05.R')
dput(degrees.1, 'degrees.1.R')
timeDif <- proc.time() - ptm 
write("Serializing the data took: ", stderr())
write(timeDif, stderr())

#output <- list(degrees = degrees.05, weights = CorTESLGenes.FDRadj.05)
#cat(format(serializeJSON(output)))