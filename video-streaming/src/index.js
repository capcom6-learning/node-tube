//@ts-check

const express = require('express');
const amqp = require('amqplib');
const routes = require('./routes');

function connectRabbit(connectionString) {
    return amqp.connect(connectionString)
        .then(connection => {
            return connection.createChannel();
        })
        .then(channel => {
            return channel.assertExchange('viewed', 'fanout')
            .then(() => channel);
        });
}

/**
 * @param {number} port
 * @param {amqp.Channel} channel
 * @param {typeof import("./services/history")} history
 * @param {import("./services/metadata")} metadata
 * @param {import("./services/storage")} storage
 */
function startHttpServer(port, channel, history, metadata, storage) {
    return new Promise(resolve => {
        const app = express();
        const microservice = {
            app,
            channel,
            history,
            metadata,
            storage
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
    const historyService = require('./services/history');
    const MetadataService = require('./services/metadata');
    const StorageService = require('./services/storage');

    const channel = await connectRabbit(config.rabbit);

    return startHttpServer(
        config.port, 
        channel, 
        historyService,
        new MetadataService(config.metadataHost, config.metadataPort),
        new StorageService(config.videoStorageHost, config.videoStoragePort)
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
