'use strict'

/**
 * Class representing all available communities Rdata files.
 */
class CommunityFileCache {
	/**
	 * @summary Creates a file cache representing all
	 * available communities Rdata files.
	 *
	 * @param {Array} files An array of type File.
	 */
	constructor(files) {
		if (!arguments.length) {
			this._files = [];
		} else {
			this._files = files;
		}
	}

	/** 
	 * @summary Sets the CommunityFileCache's files.
	 *
	 * @param {Array} files The new array of type File to 
	 * associate with this CommunityFileCache.
	 */
	set files(files) {
		this._files = files;
	}

	/**
	 * @summary Gets the CommunityFileCache's array of files.
	 *
	 * @return {Array} The CommunityFileCache's array of type File.
	 */
	get files() {
		return this._files;
	}
}

module.exports = {
	CommunityFileCache: CommunityFileCache
};