const { build } = require('esbuild');

const fs = require('fs').promises;
const path = require('path');

async function getCssFiles(dir) {
    const cssFiles = [];
    try {
        // Read the directory
        const files = await fs.readdir(dir);
        
        // Iterate over the files in the directory
        for (const file of files) {
            const fullPath = path.join(dir, file);
            console.log(fullPath)
            const stats = await fs.stat(fullPath);
            if(stats.isDirectory()) {
              const _files = getCssFiles(fullPath);
              if(_files.length) {
                console.log()
                cssFiles.push(..._files)
              }
            }
            // console.log(path.extname(file).toLowerCase())
            // Check if it's a file and has .css extension
            if (stats.isFile() && path.extname(file).toLowerCase() === '.css') {
              // console.log(1)
                cssFiles.push(fullPath);
            }
        }
    } catch (err) {
        console.error('Error reading directory or file stats:', err);
    }

    return cssFiles;
}

// Use the function
console.log(path.join(__dirname,'./components'))
getCssFiles(path.join(__dirname,'./components'))
    .then(files => console.log('CSS Files:', files))
    .catch(console.error);

// build({
//     entryPoints: ['src/index.ts'],
//     outfile: 'dist/index.js',
//     bundle: true,
//     // minify: true,
//     loader: {
//       '.ts': 'ts',
  
//     },
// }).catch(() => process.exit(1));