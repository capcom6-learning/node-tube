const config = require('./config');
const express = require('express');

function setupHandlers(app) {
    
}

function startHttpServer() {
    return new Promise(resolve => {
        const app = express();

        setupHandlers(app);

        app.listen(config.port, () => {
            resolve();
        });
    });
}

function main() {
    return startHttpServer();
}

main()
    .then(() => {
        console.log(`History service online on port ${config.port}`);
    })
    .catch(err => {
        console.error(`History service failed to start on port ${config.port}`);
        console.error(err && err.stack || err);
    });