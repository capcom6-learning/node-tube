const logger = require('./log');
const config = require('../config');

/**
 * Send viewed event to history service
 * @param {string} videoId 
 */
module.exports.sendViewedMessage = (channel, videoId) => {
    const msg = {
        videoId
    };
    const jsonMsg = JSON.stringify(msg);
    console.log(msg);

    channel.publish('viewed', '', Buffer.from(jsonMsg));
};