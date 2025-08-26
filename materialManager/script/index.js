const { build } = require('esbuild');
const path = require('path');
const fs = require('fs/promises')
const { execSync } = require('child_process');
const { lessLoader } = require('esbuild-plugin-less');
const distDir = path.join(__dirname,'../dist');
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
function removeDist(){
    return fs.rm(distDir,{
        recursive: true, force: true
    }).catch(err => {})
}

async function buildCss(){
    function buildCssBody(filePath,cssName){
        return build({
            entryPoints: [filePath],
            outfile: `dist/${cssName}.css`,
            bundle: true,
            minify: true,
            plugins:[
                lessLoader({
                    javascriptEnabled: true
                })
            ],
        })
    }
    // index.less
    await buildCssBody(path.join(__dirname,'../main/index.less'),'index');
    // 组件css
    const files =  await getFilesByExtName(path.join(__dirname,'../components'),'.less');
    for(filePath of files) {
        await buildCssBody(filePath,filePath.split('/').slice(-2)[0])
    }  
}
async function buildJs(){
    return build({
        entryPoints: [path.join(__dirname,'../main/index.ts')],
        outfile: `dist/index.js`,
        bundle: true,
        // minify: true,
        loader: {
            '.ts':'ts'
        }
    })
}
async function buildJson(){
    const files =  await getFilesByExtName(path.join(__dirname,'../json'),'.ts');
    for(file of files) {
        const targetName = file.split('/').slice(-1)[0].split('.')[0];
        await build({
            entryPoints: [file],
            outfile: `dist/${targetName}.js`,
            bundle: true,
            format:'cjs',
            platform:'node',
            loader: {
                '.ts':'ts'
            }
        }).then(async ()=> {
            // 拿到默认导出的值
            const data = require(path.join(__dirname,`../dist/${targetName}.js`));
            if(data.default) {
                await fs.writeFile(`dist/${targetName}.json`,JSON.stringify(data.default,null,2))
            }
            await fs.unlink(`dist/${targetName}.js`);
        })
    }
    const jsonFiles = await getFilesByExtName(path.join(__dirname,'../json'),'.json');
    for(file of jsonFiles) {
        const targetName = file.split('/').slice(-1)[0];
        await  fs.copyFile(file,`dist/${targetName}`)
    }
}

async function start(){
    await removeDist();
    await buildCss();
    await buildJs();
    await buildJson();
    console.log('构建成功')
}
start();