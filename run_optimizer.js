const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');

module.exports = function runOptimizer(rJSPath, buildConfigFile, prefix, targetDir) {
    return new Promise((resolve, reject) => {
	const rjs = spawn('node', [rJSPath, '-o', buildConfigFile]);
	let output = '';
	let error = '';
	rjs.stdout.on('data', (data) => {
	    output += data;
	});
	rjs.stderr.on('data', (data) => {
	    error += data;
	});
	rjs.on('close', (code) => {
	    if (code) {
		console.log(rJSPath + ' -o ' + buildConfigFile +
			    ' exited with code ' + code);
		reject(buildConfigFile);
	    } else {
		let reg = /^(.*\.js)\s+----------------/mg;
		let result;
		let copyInstructions = [];
		while ((result = reg.exec(output)) !== null) {
		    copyInstructions.push({
			source: path.join(prefix, result[1]),
			target: path.join(targetDir, result[1])
		    });
		}

		let copiedFiles = copyInstructions.map((ci) => {
		    let directory = path.dirname(ci.target);

		    // Doing this one synchronous to avoid stepping on other processes' feet
		    fs.ensureDirSync(directory);
		    fs.copySync(ci.source, ci.target);

		    return ci.target;
		});
		resolve(copiedFiles);
	    }
	});
    });
}
