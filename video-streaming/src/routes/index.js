//@ts-check

const logger = require('../services/log');
const VideoHandler = require('./video');

/**
 * @param {{ app: import("express").Express; channel: any; history: any; metadata: import("../services/metadata"); storage: import("../services/storage"); }} microservice
 */
module.exports.setupHandlers = (microservice) => {
    const app = microservice.app;

    app.get('/', async (/** @type {import("express").Request} */ req, /** @type {import("express").Response} */ res) => {
        res.send('Video streaming service');
    });

    new VideoHandler(microservice);
};