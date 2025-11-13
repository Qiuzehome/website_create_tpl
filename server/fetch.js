const http = require('http');

function fetchData(type) {
    return new Promise((resolve, reject) => {
        const req = http.request(
            `http://127.0.0.1:3000/getData?type=${type}`,
            { method: 'GET' },
            (res) => {
                let body = '';
                res.setEncoding('utf8');
                res.on('data', (chunk) => {
                    body += chunk;
                });
                res.on('end', () => {
                    try {
                        const json = JSON.parse(body || '{}');
                        resolve(json);
                    } catch (e) {
                        reject(e);
                    }
                });
            }
        );
        req.on('error', (err) => {
            reject(err);
        });
        req.end();
    });
}

module.exports = { fetchData };