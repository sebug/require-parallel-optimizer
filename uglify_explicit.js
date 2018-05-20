if (process.argv.length < 4) {
    console.error('Usage: node uglify_explicit.js allFilesDirectory targetDirectory');
    process.exitCode = 1;
    return;
}

const path = require('path');

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

function processFiles(fromDirectory, toDirectory, files) {
    console.log('processing files');
    files.forEach(f => {
	let sourceFile = path.join(fromDirectory, f);
	let targetFile = path.join(toDirectory, f);

	console.log(sourceFile + ' -> ' + targetFile);
    });
}
