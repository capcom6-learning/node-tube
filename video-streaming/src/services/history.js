const logger = require('./log');
const http = require('http');
const config = require('../config');

/**
 * Send viewed event to history service
 * @param {string} videoPath 
 */
module.exports.sendViewedMessage = (videoPath) => {
    const postOptions = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    };
    const requestBody = {
        videoPath: videoPath
    };

    const req = http.request(`http://${config.historyHost}:${config.historyPort}/viewed`, postOptions);
    req.on('close', () => {

    });
    req.on('error', (err) => {
        logger.logError(err, 'Failed to send viewed event.');
    });

    req.write(JSON.stringify(requestBody));

    req.end();
};