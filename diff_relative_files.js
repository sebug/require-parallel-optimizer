module.exports = function (allFiles, someFiles) {
    let existingDict = {};
    someFiles.forEach((f) => {
	existingDict[f] = true;
    });
    let result = [];
    allFiles.forEach(f => {
	if (!existingDict[f]) {
	    result.push(f);
	}
    });
    return result;
};
