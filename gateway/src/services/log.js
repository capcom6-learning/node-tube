module.exports.logError = (err, message) => {
    message && console.error(message);
    console.error(err && err.stack || err);
};