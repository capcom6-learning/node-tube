const logger = require('./log');
const config = require('../config');

/**
 * Send viewed event to history service
 * @param {string} videoPath 
 */
module.exports.sendViewedMessage = (channel, videoPath) => {
    const msg = {
        videoPath: videoPath
    };
    const jsonMsg = JSON.stringify(msg);

    channel.publish('viewed', '', Buffer.from(jsonMsg));
};