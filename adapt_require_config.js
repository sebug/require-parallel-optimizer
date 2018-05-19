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

module.exports = async function adaptRequireConfig(requireConfigPath) {
    console.log('from module');
    const originalContent = await fs.readFile(requireConfigPath, 'utf8');
    const tree = esprima.parseScript(originalContent, { range: true, comment: true, tokens: true });

    let topLevelConfigObject = getTopLevelConfigObject(tree);

    ensureSkipDirOptimize(topLevelConfigObject);

    const enriched = es.attachComments(tree, tree.comments, tree.tokens);

    let transformedContent = es.generate(enriched, { comment: true });

    return transformedContent;
};

