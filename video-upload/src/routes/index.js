//@ts-check

const VideoHandler = require('./video');

/**
 * @param {{ app: import("express").Express; messaging: import("../services/messaging"); metadata: import("../services/metadata"); storage: import("../services/storage"); }} microservice
 */
module.exports.setupHandlers = (microservice) => {
    const app = microservice.app;

    app.get('/', async (/** @type {import("express").Request} */ req, /** @type {import("express").Response} */ res) => {
        res.send('Video upload service');
    });

    new VideoHandler(microservice);
};