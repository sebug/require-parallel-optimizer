# Require Parallel Optimizer
Given a ton of require modules, try to find a way to efficiently bundle them in parallel.

## Motivation
I want continuous delivery to make sense, and waiting half an hour for one single Node instance to do its job both drags on my nerves and invalidates many of the teachings.

## Sample call

	node index.js ../bundle-sources ../bundle-output require.build.js

The program takes the require.build.js file and creates multiple versions of it, each only containing a subset of modules. It then runs r.js on these files in parallel.

After the modules have been bundled we minify the rest of the files. You can test this step separately:

	node calculate_missing_files.js ../bundle-sources ../bundle-output/build | node uglify_explicit.js ../bundle-sources ../bundle-output/build
