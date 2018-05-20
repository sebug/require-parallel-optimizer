if (process.argv.length < 4) {
    console.error('Usage: node calculate_missing_files.js allFilesDirectory someFilesDirectory');
    process.exitCode = 1;
    return;
}

const directoryContent = require('./directory_content');
const path = require('path');
const diffRelativeFiles = require('./diff_relative_files');

async function calculateMissingFiles(allFilesDirectory, someFilesDirectory) {
    // First, list the files in the allFilesDirectory
    let allFiles = await directoryContent(allFilesDirectory);
    allFiles = allFiles.map(f => path.relative(allFilesDirectory, f));
    let someFiles = await directoryContent(someFilesDirectory);
    someFiles = someFiles.map(f => path.relative(someFilesDirectory, f));

    let result = diffRelativeFiles(allFiles, someFiles);

    // also, exclude prebuilt files. - this is a bit specific to our process
    result = result.filter(f => f.indexOf('prebuilt') < 0);

    result.forEach(function (f) {
	console.log(f);
    });
}

calculateMissingFiles(process.argv[2], process.argv[3]);


