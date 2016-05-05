library(jsonlite)
library(psych)

setwd('C:/Users/Alex/Documents/EpiStroma/R_Scripts')
source('helpers.R')

load('TE-LGenes.RData')
load('TS-LGenes.RData')
View(edataTE.ERNeg.LGenes)
CorTES.LGenes <- cor(t(edataTE.ERNeg.LGenes),t(edataTS.ERNeg.LGenes))
#CorTES.LGenes <- CorTES.LGenes[1:100, 1:100]
Signif.TESLGenes<-r.test(54,CorTES.LGenes)
TESLGenes.padj.FDR <- p.adjust(Signif.TESLGenes$p,method="fdr",length(Signif.TESLGenes$p)) # FDR Adjustment for multiple testing
CorTESLGenes.FDRadj <- CorTES.LGenes 
CorTESLGenes.FDRadj[TESLGenes.padj.FDR>0.05] <- 0 

degrees <- getDegrees(CorTESLGenes.FDRadj)
#corMatrix <- removeUnnecessaryGenes(CorTESLGenes.FDRadj, degrees$epiDegree, degrees$stromaDegree)
#degrees <- getDegrees(corMatrix)

dput(CorTESLGenes.FDRadj, 'corMatrix.R')
dput(degrees, 'degrees.R')

output <- list(degrees = degrees, weights = CorTESLGenes.FDRadj)

cat(format(serializeJSON(output)))