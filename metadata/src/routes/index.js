//@ts-check

const express = require('express');

const VideoHandler = require('./video');

module.exports.setupHandlers = (/** @type {{ app: import('express').Express; db: import("mongodb").Db; }} */ microservice) => {
    const app = microservice.app;

    app.get('/', (/** @type {express.Request} */ req, /** @type {express.Response} */ res) => {
        res.send('Metadata service online');
    });

    new VideoHandler(microservice);
};