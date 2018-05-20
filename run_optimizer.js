const { spawn } = require('child_process');

module.exports = function runOptimizer(rJSPath, buildConfigFile) {
    return new Promise((resolve, reject) => {
	const rjs = spawn(rJSPath, ['-o', buildConfigFile]);
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
		while ((result = reg.exec(output)) !== null) {
		    console.log('bundled file ' + result[1]);
		}
	    }
	    resolve(buildConfigFile);
	});
    });
}
