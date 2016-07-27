library(psych)
library(methods)
library(Matrix)

tempMat <- matrix(1:25, nrow=5, ncol=5)

tempMat <- as(tempMat, "sparseMatrix")

setwd('/mnt/work1/users/home2/aadam/R_Scripts')

load('Andy-ScaledDataSets.RData')

ProbeGeneMap <- read.csv("028004_D_AA_20140813.txt",stringsAsFactors = F, sep = "\t")

CorTES.Normal <- cor(t(allmat.by.ctype.by.ES$No$Epi),t(allmat.by.ctype.by.ES$No$Str))
CorTES.BrP <- cor(t(allmat.by.ctype.by.ES$BrP$Epi),t(allmat.by.ctype.by.ES$BrP$Str))
CorTES.BrN <- cor(t(allmat.by.ctype.by.ES$BrN$Epi),t(allmat.by.ctype.by.ES$BrN$Str))

rownames(CorTES.Normal) = ProbeGeneMap$GeneSymbol[match(rownames(CorTES.Normal), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTES.Normal) = ProbeGeneMap$GeneSymbol[match(colnames(CorTES.Normal), (ProbeGeneMap$EntrezGeneID))]

rownames(CorTES.BrP) = ProbeGeneMap$GeneSymbol[match(rownames(CorTES.BrP), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTES.BrP) = ProbeGeneMap$GeneSymbol[match(colnames(CorTES.BrP), (ProbeGeneMap$EntrezGeneID))]

rownames(CorTES.BrN) = ProbeGeneMap$GeneSymbol[match(rownames(CorTES.BrN), (ProbeGeneMap$EntrezGeneID))]
colnames(CorTES.BrN) = ProbeGeneMap$GeneSymbol[match(colnames(CorTES.BrN), (ProbeGeneMap$EntrezGeneID))]

Signif.Normal <- r.test(22, CorTES.Normal)
Signif.BrP <- r.test(54, CorTES.BrP)
Signif.BrN <- r.test(28, CorTES.BrN)

ptm <- proc.time()

TESNormal.padj.FDR <- p.adjust(Signif.Normal$p,method="fdr",length(Signif.Normal$p)) # FDR Adjustment for multiple testing
TESBrP.padj.FDR <- p.adjust(Signif.BrP$p,method="fdr",length(Signif.BrP$p)) # FDR Adjustment for multiple testing
TESBrN.padj.FDR <- p.adjust(Signif.BrN$p,method="fdr",length(Signif.BrN$p)) # FDR Adjustment for multiple testing

CorTES.Normal.FDRadj.05 <- CorTES.Normal 

CorTES.BrP.FDRadj.05 <- CorTES.BrP 

CorTES.BrN.FDRadj.05 <- CorTES.BrN 

timeDif <- proc.time() - ptm 
write("Significance Test Took: ", stderr())
write(timeDif, stderr())

ptm <- proc.time()

CorTES.Normal.FDRadj.05[TESNormal.padj.FDR > 0.05] <- 0
CorTES.Normal.FDRadj.05 <- as(CorTES.Normal.FDRadj.05, "sparseMatrix")

CorTES.BrP.FDRadj.05[TESBrP.padj.FDR > 0.05] <- 0
CorTES.BrP.FDRadj.05 <- as(CorTES.BrP.FDRadj.05, "sparseMatrix")

CorTES.BrN.FDRadj.05[TESBrN.padj.FDR > 0.05] <- 0
CorTES.BrN.FDRadj.05 <- as(CorTES.BrN.FDRadj.05, "sparseMatrix")


timeDif <- proc.time() - ptm 
write("Overwriting Matrices With Zeros Took: ", stderr())
write(timeDif, stderr())

ptm <- proc.time()

saveRDS(CorTES.Normal.FDRadj.05, file='normal.05.RData')

saveRDS(CorTES.BrP.FDRadj.05, file='breastPositive.05.RData')

saveRDS(CorTES.BrN.FDRadj.05, file='breastNegative.05.RData')