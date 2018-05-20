if (process.argv.length < 5) {
    console.error('Usage: node require-parallel-optimizer source-directory target-directory require.build.config');
    process.exitCode = 1;
    return;
}

const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const adaptRequireConfig = require('./adapt_require_config');
const runOptimizer = require('./run_optimizer');

async function optimize(sourceDirectory, targetDirectory, requireConfigName) {
    let rjsPath = path.join(path.dirname(process.argv[1]), 'node_modules', '.bin', 'r.js');
    const mainInstance = path.join(targetDirectory, 'main');

    let existsAlready = await fs.pathExists(mainInstance);

    if (existsAlready) {
	await fs.remove(mainInstance);
    }
    
    await fs.copy(sourceDirectory, mainInstance);

    let numberOfSlices = os.cpus().length;

    let adaptedRequireFiles = await adaptRequireConfig(path.join(mainInstance, requireConfigName), numberOfSlices);

    let configFiles = [];
    for (let i = 0; i < adaptedRequireFiles.length; i += 1) {
	const adaptedPath = path.join(mainInstance, 'adapted_' + i +
				      '_' + requireConfigName);
	await fs.writeFile(adaptedPath, adaptedRequireFiles[i], 'utf8');
	configFiles.push({
	    path: adaptedPath,
	    slice: i
	});
    }

    let targetDir = path.join(mainInstance, 'build');
    let targetDirExistsAlready = await fs.pathExists(targetDir);
    if (targetDirExistsAlready) {
	await fs.remove(targetDir);
    }

    const optimizationPromises = configFiles.map(f => runOptimizer(rjsPath, f.path, path.join(mainInstance, 'build' + f.slice), targetDir));

    await Promise.all(optimizationPromises);

    console.log('After optimization. Now we will have to copy over files excluded but necessary.');
}

optimize(process.argv[2], process.argv[3], process.argv[4]);

