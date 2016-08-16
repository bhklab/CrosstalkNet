source('R_Scripts/dataModels.R')
source('R_Scripts/helpers.R')

createDFEdgesCommunities <- function(communityInteractions) {
	# Creates a data frame of cytoscape edges representing the interactions
    # happening between the specified gene and its neighbours.
    #
    # Args:
    #   communityInteractions: A data frame of epi genes, stroma genes, and the
    #				 		   interactions that occur between them. Also has
    #                          two additional columns indicating which communities
    #                          the genes belong to.
    #
    #            
    # Returns: A data frame of cytoscape edges representing interactions within and
    #		   between communities.
    edges <- createEmptyDifferentialEdges(nrow(communityInteractions))

	edges$source = communityInteractions$epi
	edges$target = communityInteractions$stroma
	edges$weight = communityInteractions$interaction
    edges$epiCommunity = paste("C", communityInteractions$epiCommunity, sep = "")
    edges$stromaCommunity = paste("C", communityInteractions$stromaCommunity, sep = "")

	edges
}

createCommunitiesNodes <- function(communityInteractions) {
    communityNumbers = sort(unique(union(communityInteractions$epiCommunity, communityInteractions$stromaCommunity)))
    result <- vector("list", length(unique(communityNumbers)))
    exclusion <- c()

    for (i in communityNumbers) {
    	genesInCommunity <- communityInteractions[which(communityInteractions$epiCommunity == i), "epi"]
        genesInCommunity <- c(genesInCommunity, communityInteractions[which(communityInteractions$stromaCommunity == i), "stroma"])
        genesInCommunity <- unique(genesInCommunity)

        if (genesInCommunity %in% exclusion) {
            write(genesInCommunity[genesInCommunity %in% exclusion], stderr())
        }

    	nodes <- createEmptyNodes(length(genesInCommunity))


    	nodes$name = genesInCommunity
    	nodes$level = rep(i, length(genesInCommunity))
    	nodes$isSource = rep(FALSE, length(genesInCommunity))

    	result[[i]] = nodes

        exclusion <- c(exclusion, genesInCommunity)
    }
    
    result
}

createCommunitiesList <- function(communityInteractions) {
    communityNumbers = sort(unique(union(communityInteractions$epiCommunity, communityInteractions$stromaCommunity)))

    result <- list()#vector("list", length(unique(communityNumbers)))

    for (i in communityNumbers) {
        genesInCommunity <- list(epi =  unique(communityInteractions[which(communityInteractions$epiCommunity == i), "epi"]),
                                 stroma = unique(communityInteractions[which(communityInteractions$stromaCommunity == i), "stroma"]))


        result[[paste("C", as.character(i), sep="")]] = genesInCommunity
    }

    result
}