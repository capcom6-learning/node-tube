const config = require('./config');

const path = require('path');

const express = require('express');
const http = require('http');
const mongodb = require('mongodb');

const historyService = require('./services/history');

const app = express();

function addRoutes(videoCollection) {
    app.get('/', (req, res) => {
        res.send('Node Video Streaming Service');
    });
    
    app.get('/video', (req, res) => {
        const videoId = new mongodb.ObjectId(req.query.id);
        videoCollection.findOne({ _id: videoId })
            .then(videoRecord => {
                if (!videoRecord) {
                    res.sendStatus(404);
                    return;
                }

                if (!req.header('Range')) {
                    historyService.sendViewedMessage(videoRecord.videoPath);
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
    
    app.listen(config.port, () => {
        console.log(`Video streaming service is listeting on port ${config.port}!`);
    });
}

function main() {
    return mongodb.MongoClient.connect(config.dbhost)
        .then(client => {
            const db = client.db(config.dbname);
            const videoCollection = db.collection('videos');

            addRoutes(videoCollection);
        });
};

main()
    .then(() => {
        console.log(`Video streaming service is listeting on port ${config.port}!`);
    })
    .catch(err => {
        console.error('Video streaming service failed to start.');
        console.error(err && err.stack || err);
    });