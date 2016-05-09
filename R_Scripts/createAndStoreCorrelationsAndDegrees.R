library(jsonlite)
library(psych)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
source('helpers.R')

load('TE-LGenes.RData')
load('TS-LGenes.RData')
View(edataTE.ERNeg.LGenes)
CorTES.LGenes <- cor(t(edataTE.ERNeg.LGenes),t(edataTS.ERNeg.LGenes))
CorTES.LGenes <- CorTES.LGenes[1:100, 1:100]
Signif.TESLGenes<-r.test(54,CorTES.LGenes)
TESLGenes.padj.FDR <- p.adjust(Signif.TESLGenes$p,method="fdr",length(Signif.TESLGenes$p)) # FDR Adjustment for multiple testing
CorTESLGenes.FDRadj.001 <- CorTES.LGenes 
CorTESLGenes.FDRadj.01 <- CorTES.LGenes 
CorTESLGenes.FDRadj.05 <- CorTES.LGenes 
CorTESLGenes.FDRadj.1 <- CorTES.LGenes 

CorTESLGenes.FDRadj.001[TESLGenes.padj.FDR>0.001] <- 0 
CorTESLGenes.FDRadj.01[TESLGenes.padj.FDR>0.01] <- 0 
CorTESLGenes.FDRadj.05[TESLGenes.padj.FDR>0.05] <- 0 
CorTESLGenes.FDRadj.1[TESLGenes.padj.FDR>0.1] <- 0 

degrees.001 <- getDegrees(CorTESLGenes.FDRadj.001)
degrees.01 <- getDegrees(CorTESLGenes.FDRadj.01)
degrees.05 <- getDegrees(CorTESLGenes.FDRadj.05)
degrees.1 <- getDegrees(CorTESLGenes.FDRadj.1)

#corMatrix <- removeUnnecessaryGenes(CorTESLGenes.FDRadj, degrees$epiDegree, degrees$stromaDegree)
#degrees <- getDegrees(corMatrix)

dput(CorTESLGenes.FDRadj.001, 'corMatrix.001.R')
dput(CorTESLGenes.FDRadj.01, 'corMatrix.01.R')
dput(CorTESLGenes.FDRadj.05, 'corMatrix.05.R')
dput(CorTESLGenes.FDRadj.1, 'corMatrix.1.R')

dput(degrees.001, 'degrees.001.R')
dput(degrees.01, 'degrees.01.R')
dput(degrees.05, 'degrees.05.R')
dput(degrees.1, 'degrees.1.R')

#output <- list(degrees = degrees.05, weights = CorTESLGenes.FDRadj.05)
#cat(format(serializeJSON(output)))