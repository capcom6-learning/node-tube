//@ts-check

const express = require('express');
const amqp = require('amqplib');
const http = require('http');
const logger = require('./services/log');

/**
 * @param {{ app: any; channel: any; history: any; metadata: import("./services/metadata"); storage: import("./services/storage"); }} microservice
 */
function setupHandlers(microservice) {
    const channel = microservice.channel;
    const history = microservice.history;
    const metadata = microservice.metadata;
    const storage = microservice.storage;

    microservice.app.get('/', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
        res.send('Node Video Streaming Service');
    });
    
    microservice.app.get('/video', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
        if (!('id' in req.query) || !req.query.id) {
            res.sendStatus(400);
            return;
        }

        metadata.getVideo(String(req.query.id))
            .then(videoRecord => {
                if (!req.header('Range')) {
                    history.sendViewedMessage(channel, videoRecord.videoPath);
                }

                const forwardRequest = storage.makeRequest(
                    videoRecord.videoPath, 
                    req.header, 
                    forwardResponse => {
                        res.writeHead(forwardResponse.statusCode, forwardResponse.headers);
                        forwardResponse.pipe(res);
                    });
            
                req.pipe(forwardRequest);
            })
            .catch(err => {
                logger.logError(err, `Failed to get video by id ${req.query.id}`);
                res.sendStatus(500);
            });


        // const videoId = new mongodb.ObjectId(req.query.id);
        // videoCollection.findOne({ _id: videoId })
        //     .then(videoRecord => {
        //         if (!videoRecord) {
        //             res.sendStatus(404);
        //             return;
        //         }

        //         if (!req.header('Range')) {
        //             history.sendViewedMessage(channel, videoRecord.videoPath);
        //         }

        //         const forwardRequest = http.request({
        //             host: config.videoStorageHost,
        //             port: config.videoStoragePort,
        //             path: `/video?path=${videoRecord.videoPath}`,
        //             method: 'GET',
        //             headers: req.headers
        //         }, forwardResponse => {
        //             res.writeHead(forwardResponse.statusCode, forwardResponse.headers);
        //             forwardResponse.pipe(res);
        //         });
            
        //         req.pipe(forwardRequest);
        //     })
        //     .catch(err => {
        //         console.error('Database query error');
        //         console.error(err && err.stack || err);
        //         res.sendStatus(500);
        //     });
    });
}

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
        setupHandlers(microservice);

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
