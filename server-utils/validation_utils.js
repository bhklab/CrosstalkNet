'use strict'
/**
 * This file contains functions for validating user input such as files, selected genes,
 * and filter values.
 *
 * @summary Functions for validating user input
 */

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}

function isPositive(n) {
    return n >= 0;
}

function isNegative(n) {
    return n <= 0;
}

/**
 * @summary Validates the filter values specified by the user.
 *
 * @param {Object} body The body of the POST request.
 * @return {Object} An object containing an error string if the filter values
 * are invalid. If the values are valid, the error is null.
 */
function validateFilters(body) {
    if (body.minPositiveWeightFirst != "NA" || (body.minPositiveWeightFirst == "NA" && body.selectedFilterFirst.positive)) {
        if (!(isNumeric(body.minPositiveWeightFirst) && isPositive(body.minPositiveWeightFirst))) {
            return { error: "First neighbours positive filter must be a positive number and not exceed the specified highest value" };
        }
    }

    if (body.minNegativeWeightFirst != "NA" || (body.minNegativeWeightFirst == "NA" && body.selectedFilterFirst.negative)) {
        if (!(isNumeric(body.minNegativeWeightFirst) && isNegative(body.minNegativeWeightFirst))) {
            return { error: "First neighbours negative filter must be a negative number and not exceed the specified lowest value" };
        }
    }

    if (body.minPositiveWeightSecond != "NA" || (body.minPositiveWeightSecond == "NA" && body.selectedFilterSecond.positive)) {
        if (!(isNumeric(body.minPositiveWeightSecond) && isPositive(body.minPositiveWeightSecond))) {
            return { error: "Second neighbours positive filter must be a positive number and not exceed the specified highest value" };
        }
    }

    if (body.minNegativeWeightSecond != "NA" || (body.minNegativeWeightSecond == "NA" && body.selectedFilterSecond.negative)) {
        if (!(isNumeric(body.minNegativeWeightSecond) && isNegative(body.minNegativeWeightSecond))) {
            return { error: "Second neighbours negative filter must be a negative number and not exceed the specified lowest value" };
        }
    }

    return { error: null };
}

/**
 * @summary Checks if the files specified are null
 * or if there was an error in obtaining the files.
 *
 * @param {Object} An object containing client-side
 * files.
 * @return {Object} An object containing an error
 * if there is something wrong with the specified files.
 * An empty object is returned if the files are valid.
 */
function validateFiles(files) {
    if (files == null) {
        return { error: "Please specify the necessary files." };
    } else if (files.error != null) {
        return { error: files.error };
    }

    return {};
}

/**
 * @summary Checks if the selected genes are in the correct
 * format.
 *
 * @param {Array} selectedGenes Assumed to be an array of Strings representing the 
 * genes selected by the user.
 * @return {Object} An object containing an error if there is something wrong with
 * the selected genes. Otherwise, the selected genes are returned instead.
 */
function validateSelectedGenes(selectedGenes) {
    var selectedGeneNames  = [];

    if (selectedGenes == null || selectedGenes == "" || selectedGenes == []) {
        return { error: "Please select at least 1 gene of interest." };
    }

    for (var i = 0; i < selectedGenes.length; i++) {
        if (selectedGenes[i] == null || selectedGenes[i].value == null) {
            return { error: "Please select a gene." };
        }

        selectedGeneNames.push(selectedGenes[i].value);
    }

    return selectedGeneNames;
}

/**
 * @summary Checks to see if the submitted row and column suffices are valid.
 *
 * @param {Object} postFixes An object containing row and column suffices as its properties.
 */
 function validateSuffices(postFixes) {
    if (postFixes == null || postFixes.colPost == null || postFixes.rowPost == null) {
        return {error: "Row and column suffices missing. Please enter them."};
    }

    if (postFixes.colPost == postFixes.rowPost) {
        return {error: "Row and column suffices must be different."};
    }

    if (postFixes.colPost.indexOf("-") >= 0 || postFixes.rowPost.indexOf("-") >= 0) {
        return {error: "Row and column sufficies must not contain dashes (-)."};
    }

    if (postFixes.colPost.length == 0 || postFixes.colPost.length > 2 || postFixes.rowPost.length == 0 
        || postFixes.rowPost.length > 2) {
        return {error: "Row and column suffices must be 1 to 2 characters in length."};
    }

    return {};
 }

module.exports = {
    isNegative: isNegative,
    isPositive: isPositive,
    isNumeric: isNumeric,
    validateFilters: validateFilters,
    validateFiles: validateFiles,
    validateSelectedGenes: validateSelectedGenes,
    validateSuffices: validateSuffices
};
