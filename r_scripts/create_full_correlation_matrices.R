library(psych)

setwd('/mnt/work1/users/home2/aadam/R_Scripts')
source('helpers.R')

ptm <- proc.time()

load('esetTE_ERNeg.RData')
load('esetTS_ERNeg.RData')
ProbeGeneMap<-read.csv("028004_D_AA_20140813.txt",stringsAsFactors = F, sep = "\t")
CorTES.LGenes <- cor(t(edataTE.ERNeg),t(edataTS.ERNeg))

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

rownames(CorTESLGenes.FDRadj.001) = ProbeGeneMap$GeneSymbol[match(rownames(CorTESLGenes.FDRadj.001), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTESLGenes.FDRadj.001) = ProbeGeneMap$GeneSymbol[match(colnames(CorTESLGenes.FDRadj.001), (ProbeGeneMap$EntrezGeneID))]

rownames(CorTESLGenes.FDRadj.01) = ProbeGeneMap$GeneSymbol[match(rownames(CorTESLGenes.FDRadj.01), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTESLGenes.FDRadj.01) = ProbeGeneMap$GeneSymbol[match(colnames(CorTESLGenes.FDRadj.01), (ProbeGeneMap$EntrezGeneID))]

rownames(CorTESLGenes.FDRadj.05) = ProbeGeneMap$GeneSymbol[match(rownames(CorTESLGenes.FDRadj.05), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTESLGenes.FDRadj.05) = ProbeGeneMap$GeneSymbol[match(colnames(CorTESLGenes.FDRadj.05), (ProbeGeneMap$EntrezGeneID))]

rownames(CorTESLGenes.FDRadj.1) = ProbeGeneMap$GeneSymbol[match(rownames(CorTESLGenes.FDRadj.1), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTESLGenes.FDRadj.1) = ProbeGeneMap$GeneSymbol[match(colnames(CorTESLGenes.FDRadj.1), (ProbeGeneMap$EntrezGeneID))]

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
saveRDS(CorTESLGenes.FDRadj.001, file='corMatrix.001.RData')
saveRDS(CorTESLGenes.FDRadj.01, file='corMatrix.01.RData')
saveRDS(CorTESLGenes.FDRadj.05, file='corMatrix.05.RData')
saveRDS(CorTESLGenes.FDRadj.1, file='corMatrix.1.RData')

saveRDS(degrees.001, file='degrees.001.RData')
saveRDS(degrees.01, file='degrees.01.RData')
saveRDS(degrees.05, file='degrees.05.RData')
saveRDS(degrees.1, file='degrees.1.RData')
timeDif <- proc.time() - ptm 
write("Serializing the data took: ", stderr())
write(timeDif, stderr())

#output <- list(degrees = degrees.05, weights = CorTESLGenes.FDRadj.05)
#cat(format(serializeJSON(output)))