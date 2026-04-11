const fs = require('fs');

const htmlPath = 'backend/aba-toolkit.html';
let content = fs.readFileSync(htmlPath, 'utf8');

const photoMapping = require('./photoMapping.json');
const replacementString = 'const photoLibrary = ' + JSON.stringify(photoMapping, null, 2) + ';';

const regex = /const photoLibrary = \{[\s\S]*?\};/;
if (regex.test(content)) {
    content = content.replace(regex, replacementString);
    fs.writeFileSync(htmlPath, content, 'utf8');
    console.log('Successfully replaced photoLibrary in aba-toolkit.html');
} else {
    console.log('Failed to match photoLibrary');
}
