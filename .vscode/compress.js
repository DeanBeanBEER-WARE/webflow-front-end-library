const fs = require('fs');
const UglifyJS = require('uglify-js');

async function compressJS(filePath) {
    try {
        const jsCode = fs.readFileSync(filePath, 'utf8');
        const compressedCode = UglifyJS.minify(jsCode).code;
        fs.writeFileSync('compressed.js', compressedCode);
        console.log('JavaScript file compressed successfully!');
    } catch (error) {
        console.error('Error compressing JavaScript file:', error);
    }
}

const filePath = process.argv[2];
if (!filePath) {
    console.error('Please provide a file path as an argument.');
    process.exit(1);
}

compressJS(filePath);
