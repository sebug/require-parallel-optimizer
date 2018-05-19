if (process.argv.length < 3) {
    console.error('Usage: require-parallel-optimizer source-directory target-directory');
    process.exitCode = 1;
    return;
}


