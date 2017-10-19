library(psych)
library(methods)
library(Matrix)

# setwd('/mnt/work1/users/home2/aadam/R_Scripts')

load('Andy-ScaledDataSets.RData')

ProbeGeneMap <- read.csv("028004_D_AA_20140813.txt",stringsAsFactors = F, sep = "\t")

saveRDS(ProbeGeneMap, "genemap.RData")

CorMatrix.Normal <- cor(t(allmat.by.ctype.by.ES$No$Epi),t(allmat.by.ctype.by.ES$No$Str))
CorMatrix.BrP <- cor(t(allmat.by.ctype.by.ES$BrP$Epi),t(allmat.by.ctype.by.ES$BrP$Str))
CorMatrix.BrN <- cor(t(allmat.by.ctype.by.ES$BrN$Epi),t(allmat.by.ctype.by.ES$BrN$Str))

CorMatrix.Delta.Positive <- CorMatrix.BrP - CorMatrix.Normal
CorMatrix.Delta.Negative <- CorMatrix.BrN - CorMatrix.Normal

Signif.Normal <- r.test(ncol(allmat.by.ctype.by.ES$No$Epi), CorMatrix.Normal)
Signif.BrP <- r.test(ncol(allmat.by.ctype.by.ES$BrP$Epi), CorMatrix.BrP)
Signif.BrN <- r.test(ncol(allmat.by.ctype.by.ES$BrN$Epi), CorMatrix.BrN)

Signif.Delta.Positive <- r.test(ncol(allmat.by.ctype.by.ES$No$Epi), CorMatrix.Normal, CorMatrix.BrP, n2=ncol(allmat.by.ctype.by.ES$BrP$Epi))
Signif.Delta.Negative <- r.test(ncol(allmat.by.ctype.by.ES$No$Epi), CorMatrix.Normal, CorMatrix.BrN, n2=ncol(allmat.by.ctype.by.ES$BrN$Epi))

saveRDS(Signif.Normal, file='normal.signif.RData')

saveRDS(Signif.BrP, file='breastPositive.signif.RData')

saveRDS(Signif.BrN, file='breastNegative.signif.RData')

saveRDS(Signif.Delta.Positive, file='deltaPositive.signif.RData')

saveRDS(Signif.Delta.Negative, file='deltaNegative.signif.RData')

saveRDS(CorMatrix.Normal, "beckNormalUnadjusted.RData")
saveRDS(CorMatrix.BrP, "beckBrPUnadjusted.RData")
saveRDS(CorMatrix.BrN, "beckBrNUnadjusted.RData")
saveRDS(CorMatrix.Delta.Postive, "beckDeltaPosUnadjusted.RData")
saveRDS(CorMatrix.Delta.Negative, "beckDeltaNegUnadjusted.RData")


# ptm <- proc.time()

# NormalES.padj.FDR <- p.adjust(Signif.Normal$p,method="fdr",length(Signif.Normal$p)) # FDR Adjustment for multiple testing
# BrPES.padj.FDR <- p.adjust(Signif.BrP$p,method="fdr",length(Signif.BrP$p)) # FDR Adjustment for multiple testing
# BrNES.padj.FDR <- p.adjust(Signif.BrN$p,method="fdr",length(Signif.BrN$p)) # FDR Adjustment for multiple testing

# Delta.Positive.padj.FDR <- p.adjust(Signif.Delta.Positive$p,method="fdr",length(Signif.Delta.Positive$p)) # FDR Adjustment for multiple testing
# Delta.Negative.padj.FDR <- p.adjust(Signif.Delta.Negative$p,method="fdr",length(Signif.Delta.Negative$p)) # FDR Adjustment for multiple testing

# CorMatrix.Normal.FDRadj.05 <- CorMatrix.Normal 

# CorMatrix.BrP.FDRadj.05 <- CorMatrix.BrP 

# CorMatrix.BrN.FDRadj.05 <- CorMatrix.BrN 

# CorMatrix.Delta.Positive.FDRadj.05 <- CorMatrix.Delta.Positive

# CorMatrix.Delta.Negative.FDRadj.05 <- CorMatrix.Delta.Negative

# saveRDS(CorMatrix.Normal.FDRadj.05, file='normal.correlation.RData')

# saveRDS(CorMatrix.BrP.FDRadj.05, file='breastPositive.correlation.RData')

# saveRDS(CorMatrix.BrN.FDRadj.05, file='breastNegative.correlation.RData')

# saveRDS(CorMatrix.Delta.Positive.FDRadj.05, file='deltaPositive.correlation.RData')

# saveRDS(CorMatrix.Delta.Negative.FDRadj.05, file='deltaNegative.correlation.RData')


# timeDif <- proc.time() - ptm 
# write("Significance Test Took: ", stderr())
# write(timeDif, stderr())

# ptm <- proc.time()

# # CorMatrix.Normal.FDRadj.05[NormalES.padj.FDR > 0.05] <- 0
# # CorMatrix.Normal.FDRadj.05 <- as(CorMatrix.Normal.FDRadj.05, "sparseMatrix")

# # CorMatrix.BrP.FDRadj.05[BrPES.padj.FDR > 0.05] <- 0
# # CorMatrix.BrP.FDRadj.05 <- as(CorMatrix.BrP.FDRadj.05, "sparseMatrix")

# # CorMatrix.BrN.FDRadj.05[BrNES.padj.FDR > 0.05] <- 0
# # CorMatrix.BrN.FDRadj.05 <- as(CorMatrix.BrN.FDRadj.05, "sparseMatrix")

# # CorMatrix.Delta.Positive.FDRadj.05[Delta.Positive.padj.FDR > 0.05] <- 0
# # CorMatrix.Delta.Positive.FDRadj.05 <- as(CorMatrix.Delta.Positive.FDRadj.05, "sparseMatrix")

# # CorMatrix.Delta.Negative.FDRadj.05[Delta.Negative.padj.FDR > 0.05] <- 0
# # CorMatrix.Delta.Negative.FDRadj.05 <- as(CorMatrix.Delta.Negative.FDRadj.05, "sparseMatrix")


# # timeDif <- proc.time() - ptm 
# # write("Overwriting Matrices With Zeros Took: ", stderr())
# # write(timeDif, stderr())

# # ptm <- proc.time()

# saveRDS(NormalES.padj.FDR, file="normal_indices.RData")
# saveRDS(BrPES.padj.FDR, file="br_positive_indices.RData")
# saveRDS(BrNES.padj.FDR, file="br_negative_indices.RData")
# saveRDS(Delta.Positive.padj.FDR, file="delta_positive_indices.RData")
# saveRDS(Delta.Negative.padj.FDR, file="delta_negative_indices.RData")