
const logger = require('../services/log')

/**
 * Setup API handlers
 * @param {Express} app 
 * @param {mongodb.MongoClient} db 
 */
module.exports.setupHandlers = (app, db) => {
    const videosCollection = db.collection('videos');
    app.post('/viewed', (req, res) => {
        const videoPath = req.body.videoPath;
        videosCollection.insertOne({ videoPath: videoPath })
            .then(() => {
                console.log(`Added video ${videoPath} to history.`);
                res.sendStatus(201);
            })
            .catch((err) => {
                logger.logError(err, `Error adding video ${videoPath} to history.`);
                res.sendStatus(500);
            });
    });
};