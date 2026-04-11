const fs = require('fs');
const path = require('path');

const baseDir = '.';
const dirs = ['animals', 'attributes', 'body-parts', 'colors', 'food', 'his-and-hers', 'nature', 'objects', 'shapes', '.'];

let mapping = {};
dirs.forEach(dir => {
    try {
        const files = fs.readdirSync(path.join(baseDir, dir));
        files.forEach(file => {
            if (file.match(/\.(jpg|png|avif|webp)$/)) {
                let name = file.split('.')[0];
                let filePath = (dir === '.' ? '' : dir + '/') + file;
                mapping[name] = filePath;
            }
        });
    } catch(e) {}
});

console.log(JSON.stringify(mapping, null, 2));
