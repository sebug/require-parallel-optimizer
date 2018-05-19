if (process.argv.length < 4) {
    console.error('Usage: node require-parallel-optimizer source-directory target-directory');
    process.exitCode = 1;
    return;
}

const fs = require('fs-extra');

function prepare(sourceDirectory, targetDirectory) {
    return fs.copy(sourceDirectory, targetDirectory);
}

async function optimize(sourceDirectory, targetDirectory) {
    await fs.copy(sourceDirectory, targetDirectory);
    console.log('copied over');
}

optimize(process.argv[2], process.argv[3]);

