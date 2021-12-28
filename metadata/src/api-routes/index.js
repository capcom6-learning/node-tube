//@ts-check

const express = require('express');

const logger = require('../services/log');
const videos = require('../models/video');

module.exports.setupHandlers = ({ app, db }) => {
    const videosCollection = db.collection('videos');

    app.get('/', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
        res.send('Metadata service online');
    });

    app.get('/video', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
        if ('id' in req.params && req.params.id) {
            return videos.getById(videosCollection, req.params.id)
                .then(video => {
                    if (!video) {
                        res.sendStatus(404);
                        return;
                    }

                    res.json(video);
                })
                .catch(err => {
                    logger.logError(err, `Failed to get video by id ${req.params.id} from database!`)
                    res.sendStatus(500);
                });
        }

        return videos.select(videosCollection)
            .then(videos => {
                res.json({ videos });
            })
            .catch(err => {
                logger.logError(err, 'Failed to get videos collection from database!');
                res.sendStatus(500);
            });
    });
};