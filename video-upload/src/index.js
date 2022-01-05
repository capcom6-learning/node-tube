//@ts-check

const express = require('express');
const amqp = require('amqplib');

const logger = require('./services/log');
const routes = require('./routes');


/**
 * @param {string} connectionString
 */
function connectRabbit(connectionString) {
    return amqp.connect(connectionString)
        .then(connection => {
            return connection.createChannel();
        });
}

/**
 * @param {number} port
 * @param {import("./services/messaging")} messaging
 * @param {import("./services/metadata")} metadata
 * @param {import("./services/storage")} storage
 */
function startHttpServer(port, messaging, metadata, storage) {
    return new Promise(resolve => {
        const app = express();
        const microservice = {
            app,
            messaging,
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

/**
 * @param {{ port: number; videoStorageHost: string; videoStoragePort: number; rabbit: string; metadataHost: string; metadataPort: number; }} config
 */
async function startMicroservice(config) {
    const MessagingService = require('./services/messaging');
    const MetadataService = require('./services/metadata');
    const StorageService = require('./services/storage');

    const channel = await connectRabbit(config.rabbit);
    
    const messagingService = new MessagingService(channel);
    await messagingService.init();

    return startHttpServer(
        config.port, 
        messagingService,
        new MetadataService(config.metadataHost, config.metadataPort),
        new StorageService(config.videoStorageHost, config.videoStoragePort)
        );
}

/**
 * @param {{ port: number; videoStorageHost: string; videoStoragePort: number; rabbit: string; metadataHost: string; metadataPort: number; }} config
 */
async function main(config) {
    return startMicroservice(config);
};

if (require.main === module) {
    const config = require('./config');

    // Only start the microservice normally if this script is the "main" module.
    main(config)
        .then(() => {
            console.log(`Video upload service is listeting on port ${config.port}!`);
        })
        .catch(err => {
            logger.logError(err);
        });
}
else {
    // Otherwise we are running under test
    module.exports = {
        startMicroservice,
    };
}
