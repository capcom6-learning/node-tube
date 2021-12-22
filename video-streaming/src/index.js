const config = require('./config');

const express = require('express');
const http = require('http');
const mongodb = require('mongodb');
const amqp = require('amqplib');

const historyService = require('./services/history');

function setupHandlers(microservice) {
    const videoCollection = microservice.db.collection('videos');
    const channel = microservice.channel;
    const history = microservice.history;

    microservice.app.get('/', (req, res) => {
        res.send('Node Video Streaming Service');
    });
    
    microservice.app.get('/video', (req, res) => {
        const videoId = new mongodb.ObjectId(req.query.id);
        videoCollection.findOne({ _id: videoId })
            .then(videoRecord => {
                if (!videoRecord) {
                    res.sendStatus(404);
                    return;
                }

                if (!req.header('Range')) {
                    history.sendViewedMessage(channel, videoRecord.videoPath);
                }

                const forwardRequest = http.request({
                    host: config.videoStorageHost,
                    port: config.videoStoragePort,
                    path: `/video?path=${videoRecord.videoPath}`,
                    method: 'GET',
                    headers: req.headers
                }, forwardResponse => {
                    res.writeHead(forwardResponse.statusCode, forwardResponse.headers);
                    forwardResponse.pipe(res);
                });
            
                req.pipe(forwardRequest);
            })
            .catch(err => {
                console.error('Database query error');
                console.error(err && err.stack || err);
                res.sendStatus(500);
            });
    });
    
    microservice.app.get('/videos', (req, res) => {
        return videoCollection.find()
            .toArray()
            .then(videos => {
                res.json({
                    videos
                });
            })
            .catch(err => {
                console.error("Failed to get videos collection from database!");
                console.error(err && err.stack || err);
                res.sendStatus(500);
            });
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

function connectDb(dbHost, dbName) {
    return mongodb.MongoClient.connect(dbHost)
        .then(client => {
            const db = client.db(dbName);
            return {
                db,
                close: () => client.close()
            };
        });
}

function startHttpServer(port, db, channel, history) {
    return new Promise(resolve => {
        const app = express();
        const microservice = {
            app,
            channel,
            history,
            db: db.db, 
        };
        setupHandlers(microservice);

        const server = app.listen(port, () => {
            microservice.close = () => {
                return new Promise(resolve => {
                    server.close(() => resolve());
                })
                .then(() => {
                    return db.close();
                });
            };
            resolve(microservice);
        });
    });
}

async function startMicroservice(config) {
    const db = await connectDb(config.dbHost, config.dbName);
    const channel = await connectRabbit(config.rabbit);

    return startHttpServer(config.port, db, channel, historyService);
}

async function main() {
    return startMicroservice(config);
};

if (require.main === module) {
    // Only start the microservice normally if this script is the "main" module.
    main()
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
