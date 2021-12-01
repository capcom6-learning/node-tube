const path = require('path');

const express = require('express');
const http = require('http');
const mongodb = require('mongodb');

const app = express();

require('dotenv').config()

if (!process.env.PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}
if (!process.env.VIDEO_STORAGE_HOST) {
    throw new Error('Please specify video storage address with the enviroment variable VIDEO_STORAGE_HOST.');
}
if (!process.env.VIDEO_STORAGE_PORT) {
    throw new Error('Please specify video storage port with the enviroment variable VIDEO_STORAGE_PORT.');
}
if (!process.env.DBHOST) {
    throw new Error('Please specify database address with the enviroment variable DBHOST.');
}
if (!process.env.DBNAME) {
    throw new Error('Please specify database name with the enviroment variable DBNAME.');
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

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

                const forwardRequest = http.request({
                    host: VIDEO_STORAGE_HOST,
                    port: VIDEO_STORAGE_PORT,
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
    
    app.listen(PORT, () => {
        console.log(`Video streaming service is listeting on port ${PORT}!`);
    });
}

function main() {
    return mongodb.MongoClient.connect(DBHOST)
        .then(client => {
            const db = client.db(DBNAME);
            const videoCollection = db.collection('videos');

            addRoutes(videoCollection);
        });
};

main()
    .then(() => {
        console.log(`Video streaming service is listeting on port ${PORT}!`);
    })
    .catch(err => {
        console.error('Video streaming service failed to start.');
        console.error(err && err.stack || err);
    });