const os = require('os');
const path = require('path');
const { spawn } = require('child_process');

function runBatch(uglifyExplicitPath, sourceDirectory, targetDirectory, batch) {
    return new Promise((resolve, reject) => {
	const uglifyExplicit = spawn(process.argv[0], [uglifyExplicitPath, sourceDirectory, targetDirectory]);

	let output = '';
	let error = '';
	uglifyExplicit.stdout.on('data', (data) => {
	    output += data;
	});
	uglifyExplicit.stderr.on('data', (data) => {
	    error += data;
	});

	uglifyExplicit.on('close', (code) => {
	    if (code) {
		console.error(error);
		console.out(output);
		console.log(process.argv[0] + ' ' +
			    uglifyExplicitPath + ' ' +
			    sourceDirectory + ' ' +
			    targetDirectory +
			    'exited with code ' + code);
		reject(batch);
	    } else {
		console.log(output);
		console.log(process.argv[0] + ' ' +
			    uglifyExplicitPath + ' ' +
			    sourceDirectory + ' ' +
			    targetDirectory +
			    'exited successfully');
		resolve(batch);
	    }
	});
	
	uglifyExplicit.stdin.setEncoding('utf-8');
	batch.forEach(f => {
	    console.log('minifying ' + f);
	    uglifyExplicit.stdin.write(f + '\n');
	});

	uglifyExplicit.stdin.end();
    });
}

module.exports = async function (sourceDirectory, targetDirectory, filesToUglify) {
    let numberOfSlices = os.cpus().length;

    console.log('Main bundling done, uglifying the remaining ' +
		filesToUglify.length + ' files in ' +
		numberOfSlices + ' batches');

    let batches = [];
    let totalFiles = filesToUglify.length;
    let sliceLength = Math.floor(totalFiles / numberOfSlices);
    let start = 0;
    let end;

    let uglifyExplicitPath = path.join(path.dirname(process.argv[1]), 'uglify_explicit.js');

    for (let i = 0; i < numberOfSlices; i += 1) {
	if (i === numberOfSlices - 1) {
	    end = totalFiles;
	} else {
	    end = start + sliceLength;
	}

	let batch = [];
	for (let j = start; j < end; j += 1) {
	    batch.push(filesToUglify[j]);
	}

	batches.push(batch);

	start += sliceLength;
    }

    let runUglifyPromises = batches.map(batch => {
	return runBatch(uglifyExplicitPath, sourceDirectory, targetDirectory, batch);
    });

    await Promise.all(runUglifyPromises);
};
