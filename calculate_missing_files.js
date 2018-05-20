if (process.argv.length < 4) {
    console.error('Usage: node calculate_missing_files.js allFilesDirectory someFilesDirectory');
    process.exitCode = 1;
    return;
}

const directoryContent = require('./directory_content');

async function calculateMissingFiles(allFilesDirectory, someFilesDirectory) {
    // First, list the files in the allFilesDirectory
    let allFiles = await directoryContent(allFilesDirectory);
    let someFiles = await directoryContent(someFilesDirectory);
    let someFilesPathAltered = someFiles.map((f) => f.replace(someFilesDirectory, allFilesDirectory));
    let existingDict = {};
    someFilesPathAltered.forEach((f) => {
	existingDict[f] = true;
    });
    let result = [];
    allFiles.forEach(f => {
	if (!existingDict[f]) {
	    result.push(f);
	}
    });
    
    console.log(result);
}

calculateMissingFiles(process.argv[2], process.argv[3]);


