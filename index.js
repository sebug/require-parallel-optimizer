if (process.argv.length < 5) {
    console.error('Usage: node require-parallel-optimizer source-directory target-directory require.build.config');
    process.exitCode = 1;
    return;
}

const fs = require('fs-extra');
const path = require('path');
const adaptRequireConfig = require('./adapt_require_config');

async function optimize(sourceDirectory, targetDirectory, requireConfigName) {
    let rjsPath = path.join(path.dirname(process.argv[1]), 'node_modules', '.bin', 'r.js');
    const mainInstance = path.join(targetDirectory, 'main');
    await fs.copy(sourceDirectory, mainInstance);

    let numberOfSlices = 4;

    let adaptedRequireFiles = await adaptRequireConfig(path.join(mainInstance, requireConfigName), numberOfSlices);

    for (let i = 0; i < adaptedRequireFiles.length; i += 1) {
	const adaptedPath = path.join(mainInstance, 'adapted_' + i +
				      '_' + requireConfigName);
	await fs.writeFile(adaptedPath, adaptedRequireFiles[i], 'utf8');
    }
}

optimize(process.argv[2], process.argv[3], process.argv[4]);

