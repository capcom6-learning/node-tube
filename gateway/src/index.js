//@ts-check

const express = require('express');
const http = require('http');
const logger = require('./services/log');
const routes = require('./routes');

/**
 * @param {number} port
 * @param {import("./services/metadata")} metadata
 */
function startHttpServer(port, metadata) {
    return new Promise(resolve => {
        const app = express();
        const microservice = {
            app,
            metadata
        };
        routes.setupHandlers(microservice);

        const server = app.listen(port, () => {
            microservice.close = () => {
                return new Promise(resolve => {
                    server.close(() => resolve());
                });
            };
            resolve(microservice);
        });
    });
}

async function startMicroservice(config) {
    const MetadataService = require('./services/metadata');

    return startHttpServer(
        config.port,
        new MetadataService(config.metadataHost, config.metadataPort),
    );
}

async function main(config) {
    return startMicroservice(config);
};

if (require.main === module) {
    const config = require('./config');

    // Only start the microservice normally if this script is the "main" module.
    main(config)
        .then(() => {
            console.log(`Video streaming service is listeting on port ${config.port}!`);
        })
        .catch(err => {
            console.error('Video streaming service failed to start.');
            console.error(err && err.stack || err);
        });
}
else {
    // Otherwise we are running under test
    module.exports = {
        startMicroservice,
    };
}
