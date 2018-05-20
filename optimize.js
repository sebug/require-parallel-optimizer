const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const adaptRequireConfig = require('./adapt_require_config');
const runOptimizer = require('./run_optimizer');

module.exports = async function optimize(sourceDirectory, targetDirectory, requireConfigName) {
    let rjsPath = path.join(path.dirname(process.argv[1]), 'node_modules', '.bin', 'r.js');

    let existsAlready = await fs.pathExists(targetDirectory);

    if (existsAlready) {
	await fs.remove(targetDirectory);
    }
    
    await fs.copy(sourceDirectory, targetDirectory);

    let numberOfSlices = os.cpus().length;

    let adaptedRequireFiles = await adaptRequireConfig(path.join(targetDirectory, requireConfigName), numberOfSlices);

    let configFiles = [];
    for (let i = 0; i < adaptedRequireFiles.length; i += 1) {
	const adaptedPath = path.join(targetDirectory, 'adapted_' + i +
				      '_' + requireConfigName);
	await fs.writeFile(adaptedPath, adaptedRequireFiles[i], 'utf8');
	configFiles.push({
	    path: adaptedPath,
	    slice: i
	});
    }

    let targetDir = path.join(targetDirectory, 'build');
    let targetDirExistsAlready = await fs.pathExists(targetDir);
    if (targetDirExistsAlready) {
	await fs.remove(targetDir);
    }

    const optimizationPromises = configFiles.map(f => runOptimizer(rjsPath, f.path, path.join(targetDirectory, 'build' + f.slice), targetDir));

    let bundleFileGroups = await Promise.all(optimizationPromises);

    // cue the array.smoosh
    let copiedFiles = [];
    bundleFileGroups.forEach(files => files.forEach(f => copiedFiles.push(f)));

    copiedFiles.forEach(f => console.log('Copied over ' + f));

    console.log('After optimization. Now we will have to copy over files excluded but necessary.');
}
