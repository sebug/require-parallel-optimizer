const fs = require('fs-extra');
const path = require('path');
const es = require('escodegen');
const esprima = require('esprima');

function getTopLevelConfigObject(tree) {
    if (tree.type === 'Program') {
	if (!tree.body || !tree.body.length) {
	    throw new Error("Tree body not long enough");
	}
	let innerConfigObject;
	for (let i = 0; i < tree.body.length && !innerConfigObject; i += 1) {
	    innerConfigObject = getTopLevelConfigObject(tree.body[i]);
	}
	return innerConfigObject;
    } else if (tree.type === 'ExpressionStatement') {
	return getTopLevelConfigObject(tree.expression);
    } else if (tree.type === 'ObjectExpression') {
	return tree;
    } else {
	console.log(tree);
    }
}

function ensureSkipDirOptimize(objectExpression) {
    let skipDirOptimizeProperty =
	objectExpression.properties.filter(p => p.key.name === 'skipDirOptimize')[0];
    if (!skipDirOptimizeProperty) {
	skipDirOptimizeProperty = {
	    type: 'Property',
	    key: {
		type: 'Identifier',
		name: 'skipDirOptimize'
	    },
	    computed: false,
	    value: {
		type: 'Literal',
		value: true,
		raw: 'true'
	    },
	    kind: 'init',
	    method: false,
	    shorthand: false
	};
	objectExpression.properties.unshift(skipDirOptimizeProperty);
    } else {
	skipDirOptimizeProperty.value.value = true;
	skipDirOptimizeProperty.value.raw = 'true';
    }
}

function getTotalModules(objectExpression) {
    let modulesProperty =
	objectExpression.properties.filter(p => p.key.name === 'modules')[0];

    if (!modulesProperty) {
	throw new Error('Could not find top level modules property');
    }
    if (!modulesProperty.value) {
	throw new Error('Could not find modules property value');
    }
    if (modulesProperty.value.type !== 'ArrayExpression') {
	throw new Error('Modules property value is not ArrayExpression but ' + modulesProperty.value.type);
    }
    return modulesProperty.value.elements.length;
}

module.exports = async function adaptRequireConfig(requireConfigPath, numberOfSlices) {
    let result = [];
    let totalModules;
    let sliceLength;
    let start;
    let end;

    for (let i = 0; i < numberOfSlices; i += 1) {
	const originalContent = await fs.readFile(requireConfigPath, 'utf8');
	const tree = esprima.parseScript(originalContent, { range: true, comment: true, tokens: true });

	let topLevelConfigObject = getTopLevelConfigObject(tree);

	if (!totalModules) {
	    totalModules = getTotalModules(topLevelConfigObject);
	    sliceLength = Math.floor(totalModules / numberOfSlices);
	    start = 0;
	}

	if (i === numberOfSlices - 1) {
	    end = totalModules + 1;
	} else {
	    end = start + sliceLength;
	}

	console.log("[" + start + ", " + end + ")");

	ensureSkipDirOptimize(topLevelConfigObject);

	const enriched = es.attachComments(tree, tree.comments, tree.tokens);

	let transformedContent = es.generate(enriched, { comment: true });

	result.push(transformedContent);

	start += sliceLength;
    }

    return result;
};

