source('R_Scripts/dataModels.R')

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

	edges
}

createCommunitiesNodes <- function(communityInteractions) {
    communityNumbers = unique(union(communityInteractions$epiCommunity, communityInteractions$stromaCommunity))
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

    	# nodes[1, "level"] = 0
    	nodes[1, "isSource"] = TRUE

    	result[[i]] = nodes

        exclusion <- c(exclusion, genesInCommunity)
    }
    
    result
}