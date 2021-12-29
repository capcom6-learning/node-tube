//@ts-check

const logger = require('../services/log');
const path = require('path');
const express = require('express');

/**
 * @param {{ app: import("express").Express; metadata: import("../services/metadata"); }} microservice
 */
module.exports.setupHandlers = (microservice) => {
    const app = microservice.app;
    const metadata = microservice.metadata;

    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hbs');

    app.use(express.static('public'));

    app.get('/', async (/** @type {import("express").Request} */ req, /** @type {import("express").Response} */ res) => {
        try {
            const videos = await metadata.selectVideo();

            res.render('video-list', { videos });
        } catch (err) {
            logger.logError(err, `Failed to get videos`);
            res.sendStatus(500);
        }
    });
    
    app.get('/video', (/** @type {import("express").Request} */ req, /** @type {import("express").Response} */ res) => {
        if (!('id' in req.query) || !req.query.id) {
            res.sendStatus(400);
            return;
        }

        res.sendStatus(200);
    });
};