options(warn = -1)
library(methods)
library(jsonlite)

source('R_Scripts/helpers.R')
source('R_Scripts/communityHelpers.R')
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
filePath <- settings$filePath

communityInteractions <- readFileWithValidation(filePath)
communityNumbers <- sort(unique(union(communityInteractions$epiCommunity, communityInteractions$stromaCommunity)))
communityNumbers <- paste("C", communityNumbers, sep="")

edges <- createDFEdgesCommunities(communityInteractions)
nodes <- createCommunitiesNodes(communityInteractions)
communities <- createCommunitiesList(communityInteractions)

result <- list(nodes = nodes, edges = edges, communities = communities, communityNumbers = communityNumbers)
cat(format(toJSON(result)))