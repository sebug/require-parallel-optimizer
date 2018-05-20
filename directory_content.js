const fs = require('fs-extra');
const path = require('path');

module.exports = async function directoryContent(dir) {
    let files = await fs.readdir(dir);
    let result = [];
    for (let i = 0; i < files.length; i += 1) {
	let file = files[i];
	let fStat = await fs.stat(path.join(dir, file));
	if (fStat.isDirectory()) {
	    let innerResult = await directoryContent(path.join(dir, file));
	    innerResult.forEach((f2) => result.push(f2));
	} else {
	    result.push(path.join(dir, file));
	}
    }
    return result;
};

