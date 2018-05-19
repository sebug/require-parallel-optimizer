const fs = require('fs-extra');
const path = require('path');
const es = require('escodegen');
const esprima = require('esprima');

module.exports = async function adaptRequireConfig(requireConfigPath) {
    console.log('from module');
    const originalContent = await fs.readFile(requireConfigPath, 'utf8');
    const tree = esprima.parseScript(originalContent, { range: true, comment: true, tokens: true });
    
    const enriched = es.attachComments(tree, tree.comments, tree.tokens);

    let transformedContent = es.generate(enriched, { comment: true });
    console.log(transformedContent);
};

