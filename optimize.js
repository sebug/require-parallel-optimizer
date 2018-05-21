const fs = require('fs-extra');
const path = require('path');
const os = require('os');
const adaptRequireConfig = require('./adapt_require_config');
const runOptimizer = require('./run_optimizer');
const diffRelativeFiles = require('./diff_relative_files');
const directoryContent = require('./directory_content');
const runUglifyParallel = require('./run_uglify_parallel');

module.exports = async function optimize(sourceDirectory, targetDirectory, requireConfigName, rjsPath) {
    rjsPath = rjsPath || path.join(path.dirname(process.argv[1]), 'node_modules', '.bin', 'r.js');

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

    let allFiles = await directoryContent(sourceDirectory);
    allFiles = allFiles.map(f => path.relative(sourceDirectory, f));
    let someFiles = copiedFiles.map(f => path.relative(targetDir, f));

    let filesToUglify = diffRelativeFiles(allFiles, someFiles);

    await runUglifyParallel(sourceDirectory, targetDir, filesToUglify);
}
