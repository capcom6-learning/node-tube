//@ts-check

const express = require('express');

const VideoHandler = require('./video');

// const logger = require('../services/log');
// const videos = require('../models/video');

module.exports.setupHandlers = (/** @type {{ app: import('express').Express; db: import("mongodb").Db; }} */ microservice) => {
    const app = microservice.app;

    app.get('/', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
        res.send('Metadata service online');
    });

    new VideoHandler(microservice);

    // app.get('/video', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
    //     if ('id' in req.query && req.query.id) {
    //         return videos.getById(videosCollection, String(req.query.id))
    //             .then(video => {
    //                 if (!video) {
    //                     res.sendStatus(404);
    //                     return;
    //                 }

    //                 res.json(video);
    //             })
    //             .catch(err => {
    //                 logger.logError(err, `Failed to get video by id ${req.params.id} from database!`)
    //                 res.sendStatus(500);
    //             });
    //     }

    //     return videos.select(videosCollection)
    //         .then(videos => {
    //             res.json({ videos });
    //         })
    //         .catch(err => {
    //             logger.logError(err, 'Failed to get videos collection from database!');
    //             res.sendStatus(500);
    //         });
    // });
};