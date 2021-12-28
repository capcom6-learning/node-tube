//@ts-check

const logger = require('../services/log');
const path = require('path');
const express = require('express');

/**
 * @param {{ app: import("express").Express; channel: any; history: any; metadata: import("../services/metadata"); storage: import("../services/storage"); }} microservice
 */
module.exports.setupHandlers = (microservice) => {
    const app = microservice.app;
    const channel = microservice.channel;
    const history = microservice.history;
    const metadata = microservice.metadata;
    const storage = microservice.storage;

    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hbs');

    app.use(express.static('public'));

    microservice.app.get('/', async (/** @type {import("express").Request} */ req, /** @type {import("express").Response} */ res) => {
        try {
            const videos = await metadata.selectVideo();

            res.render('video-list', { videos });
        } catch (err) {
            logger.logError(err, `Failed to get videos`);
            res.sendStatus(500);
        }
    });
    
    microservice.app.get('/video', (/** @type {import("express").Request} */ req, /** @type {import("express").Response} */ res) => {
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
    });
};