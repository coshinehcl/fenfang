const fs = require('fs').promises;
const path = require('path');
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
module.exports = {
    getFilesByExtName
}