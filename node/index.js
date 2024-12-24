const http = require('http');
const fs = require('fs');
const path = require('path');

// 创建服务器
const server = http.createServer((req, res) => {
    // 解析URL路径
    let urlPath = req.url;
    console.log(urlPath)
    // 检查是否为 '/test' 请求
    if (urlPath.startsWith('/materials')) {
        // 构建目标HTML文件的绝对路径
        const filePath = path.join(__dirname, `../${urlPath}`);
        
        // 读取文件并发送响应
        fs.readFile(filePath, (err, content) => {
            if (err) {
                // 如果读取文件时出错，返回404状态码和错误信息
                res.writeHead(404, {'Content-Type': 'text/plain'});
                res.end('File not found');
            } else {
                // 成功读取文件后，设置响应头为HTML类型，并发送文件内容
                const contentTypeMap = {
                    '.js':'text/javascript',
                    '.css':'text/css',
                    '.json':'application/json',
                    '.html':'text/html'
                }
                res.writeHead(200, {'Content-Type': contentTypeMap[path.extname(filePath)]});
                res.end(content);
            }
        });
    } else {
        // 对其他路由返回404
        res.writeHead(404, {'Content-Type': 'text/plain'});
        res.end('Not Found');
    }
});

// 监听3000端口
server.listen(443, () => {
    console.log('Server is running on port 3000');
});