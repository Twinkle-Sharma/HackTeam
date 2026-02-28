const http = require('http');
const server = http.createServer((req, res) => {
    res.writeHead(200);
    res.end('alive');
});
server.listen(5000, () => {
    console.log('Test server running on 5000');
});
