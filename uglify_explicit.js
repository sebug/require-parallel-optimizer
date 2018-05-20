if (process.argv.length < 4) {
    console.error('Usage: node uglify_explicit.js allFilesDirectory targetDirectory');
    process.exitCode = 1;
    return;
}

const path = require('path');
const fs = require('fs-extra');
const UglifyJS = require('uglify-js');

process.stdin.setEncoding('utf8');

let filesByLine = '';

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
	filesByLine += chunk;
    }
});

process.stdin.on('end', () => {
    let fileArr = filesByLine.split(/\r?\n/);
    processFiles(process.argv[2], process.argv[3], fileArr);
});

async function processFiles(fromDirectory, toDirectory, files) {
    let contents = [];
    let fileContentPromises = files.map(f => {
	let sourceFile = path.join(fromDirectory, f);
	let targetFile = path.join(toDirectory, f);

	return fs.stat(sourceFile).then(s => {
	    if (s.isDirectory()) {
		return true;
	    } else {
		return fs.readFile(sourceFile, 'utf8').then((content) => {
		    let uglified = UglifyJS.minify(content);
		    contents.push({
			sourceFile: sourceFile,
			targetFile: targetFile
		    });

		    let dirname = path.dirname(targetFile);
		    fs.ensureDirSync(dirname);

		    return fs.writeFile(targetFile, uglified.code, 'utf8')
			.then(function () {
			    return true;
			});
		});
	    }
	});
    });

    await Promise.all(fileContentPromises);
}
