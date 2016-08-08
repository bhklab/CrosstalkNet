options(warn = -1)
library(methods)
library(jsonlite)

source('R_Scripts/helpers.R')
source('R_Scripts/communityHelpers.R')
args <- commandArgs(trailingOnly = TRUE)

settings <- fromJSON(args[2])
filePath <- settings$filePath

communityInteractions <- readFileWithValidation(filePath)

edges <- createDFEdgesCommunities(communityInteractions)
nodes <- createCommunitiesNodes(communityInteractions)

result <- list(nodes = nodes, edges = edges)
cat(format(toJSON(result, auto_unbox = TRUE)))