const { build } = require('esbuild');
const path = require('path');
const fs = require('fs/promises')
const { lessLoader } = require('esbuild-plugin-less');
async function getFilesByExtName(dir,ext) {
    const targetFiles = [];
    try {
        const files = await fs.readdir(dir);
        for (const file of files) {
            const fullPath = path.join(dir, file);
            const stats = await fs.stat(fullPath);
            if(stats.isDirectory()) {
              const _targetFiles = await getFilesByExtName(fullPath,ext);
              if(_targetFiles.length) {
                targetFiles.push(..._targetFiles)
              }
            }else if (stats.isFile() && path.extname(file).toLowerCase() === ext) {
                targetFiles.push(fullPath);
            } 
        }
    } catch(err){
        console.error('Error reading directory or file stats:', err);
    }
    return targetFiles;
}
// 构建css
{
    function buildCss(filePath,cssName){
        build({
            entryPoints: [filePath],
            outfile: `dist/${cssName}.css`,
            bundle: true,
            minify: true,
            plugins:[
                lessLoader()
            ],
        })
    }
    // index.less
    getFilesByExtName(path.join(__dirname,'../main'),'.less').then(files => {
        files.forEach(filePath => buildCss(filePath,filePath.split('/').slice(-1)[0].split('.')[0]))
    })
    // 组件css
    getFilesByExtName(path.join(__dirname,'../components'),'.less').then(files => {
        files.forEach(filePath => buildCss(filePath,filePath.split('/').slice(-2)[0]))
    })
}
// 构建js
build({
    entryPoints: [path.join(__dirname,'../main/index.ts')],
    outfile: `dist/index.js`,
    bundle: true,
    // minify: true,
    loader: {
        '.ts':'ts'
    }
}).catch(() => process.exit(1)).then(res => {
    console.log('构建成功🏅')
});