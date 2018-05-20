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
    
    console.log(result);
}

calculateMissingFiles(process.argv[2], process.argv[3]);


