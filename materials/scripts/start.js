const path = require('path');
const fs = require('fs').promises;
const { build } = require('esbuild');
const { lessLoader } = require('esbuild-plugin-less');
const { getFilesByExtName } = require('./utils.js');

function buildCss(filePath,distName){
    build({
        entryPoints: [filePath],
        outfile: `dist/${distName}.css`,
        bundle: true,
        plugins:[
            lessLoader()
        ],
    }).catch(() => process.exit(1));
}
// 移动文件
fs.copyFile(path.join(__dirname,'../defaultRecordJSON.json'),path.join(__dirname,'../dist/defaultRecordJSON.json'))
// 构建html css
buildCss(path.join(__dirname,'../src/index.less'),'index');
// 构建组件css
getFilesByExtName(path.join(__dirname,'../components'),'.less').then(files => {
    files.forEach(filePath => {
        buildCss(filePath,filePath.split('/').slice(-2)[0]);
    })
})
function buildTs(filePath,distName){
    build({
        entryPoints: [filePath],
        outfile: `dist/${distName}.js`,
        bundle: true,
        loader: {
            '.ts':'ts'
        }
    }).catch(() => process.exit(1));
}
// 构建index.ts
buildTs(path.join(__dirname,'../src/index.ts'),'index')
