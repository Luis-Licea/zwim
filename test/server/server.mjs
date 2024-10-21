import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { parseArgs } from 'node:util';

const options = {
    host: {
        type: 'string',
        default: '127.0.0.1'
    },
    port: {
        type: 'string',
        default: '8080'
    },
    help: {
        type: 'boolean',
        short: 'h',
        default: false
    },
};

const server = createServer(async (request, response) => {
    const filePath = request.url.length > 1 ? `${import.meta.dirname}${request.url}` : `${import.meta.dirname}/dumps.wikimedia.org.html`;
    const extensions = {
        '.css': 'text/css',
        '.html': 'text/html',
        '.jpg': 'image/jpg',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.png': 'image/png',
        '.wav': 'audio/wav',
        '.zim': 'application/octet-stream',
    };
    const contentType = extensions[extname(filePath)] ?? extensions['.html'];
    const content = await readFile(filePath).catch(error => error);
    if (content instanceof Error) {
        if (content.code == 'ENOENT') {
            const content = await readFile('./404.html').catch(() => '<h1>File does not exist</h1>');
            response.writeHead(200, { 'content-type': contentType });
            response.end(content);
        } else {
            response.writeHead(500);
            response.end(`<h1>Unkown error: ${content.code}<h1>`);
        }
    } else {
        response.writeHead(200, { 'content-type': contentType });
        response.end(content);
    }

});

export default {
    host: '127.0.0.1',
    port: 8080,
    start: function(port = this.port, host = this.host) {
        return { server: server.listen(port, host), address: `http://${host}:${port}/` };
    }
};

if (import.meta.filename === process.argv[1]) {
    const { values: { port, host, help } } = parseArgs({ options });
    if (help) {
        console.log(options);
    } else {
        server.listen(port, host);
        console.log(`http://${host}:${port}/`);
    }
}
