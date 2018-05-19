if (process.argv.length < 5) {
    console.error('Usage: node require-parallel-optimizer source-directory target-directory require.build.config');
    process.exitCode = 1;
    return;
}

const fs = require('fs-extra');
const path = require('path');

function prepare(sourceDirectory, targetDirectory) {
    return fs.copy(sourceDirectory, targetDirectory);
}

async function optimize(sourceDirectory, targetDirectory, requireConfigName) {
    const mainInstance = path.join(targetDirectory, 'main');
    await fs.copy(sourceDirectory, mainInstance);
    console.log('copied over');
}

optimize(process.argv[2], process.argv[3], process.argv[4]);

