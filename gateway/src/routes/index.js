//@ts-check

const logger = require('../services/log');
const path = require('path');
const express = require('express');
const ApiHandler = require('./api');
const { runInThisContext } = require('vm');

class Handler {
    /**
     * @param {{ app: import("express").Express; metadata: import("../services/metadata"); history: import("../services/history"); }} service
     */
    constructor(service) {
        this.app = service.app;
        this.metadata = service.metadata;
        this.history = service.history;

        this.index = this.index.bind(this);
        this.upload = this.upload.bind(this);
        this.getHistory = this.getHistory.bind(this);
        this.video = this.video.bind(this);

        this.app.get('/', this.index);
        this.app.get('/upload', this.upload);
        this.app.get('/history', this.getHistory);
        this.app.get('/video', this.video);
    }

    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async index(req, res) {
        try {
            const videos = await this.metadata.selectVideo();

            res.render('video-list', { videos });
        } catch (err) {
            logger.logError(err, `Failed to get videos`);
            res.sendStatus(500);
        }
    }

    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    upload(req, res) {
        res.render("upload-video", {});
    }

    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    getHistory(req, res) {
        this.history.selectHistory()
            .then(history => {
                res.render("history", { videos: history });
            })
            .catch((err) => {
                logger.logError(err, `Failed to get history`);
                res.sendStatus(500);
            });
    }

    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    async video(req, res) {
        const id = req.query.id || '';
        if (!id) {
            res.redirect('/');
            return;
        }

        try {
            const metadata = await this.metadata.getVideo(id.toString());
            const url = `/api/video?id=${metadata._id}`;

            res.render("play-video", { video: { metadata, url } });
        } catch (err) {
            logger.logError(err, `Failed to play video ${id}`);
            res.sendStatus(500);
        }
        
    }
}

/**
 * @param {{ app: import("express").Express; metadata: import("../services/metadata"); streaming: import("../services/streaming"); uploading: import("../services/upload"); history: import("../services/history");}} microservice
 */
module.exports.setupHandlers = (microservice) => {
    const app = microservice.app;
    const metadata = microservice.metadata;

    app.set('views', path.join(__dirname, '../views'));
    app.set('view engine', 'hbs');

    app.use(express.static('public'));
    
    new Handler(microservice);
    new ApiHandler(microservice);
};