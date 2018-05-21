if (process.argv.length < 5) {
    console.error('Usage: node require-parallel-optimizer source-directory target-directory require.build.config [path_to_r.js]');
    process.exitCode = 1;
    return;
}

const optimize = require('./optimize');

optimize(process.argv[2], process.argv[3], process.argv[4], process.argv[5]);

