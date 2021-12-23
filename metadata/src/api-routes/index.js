const logger = require('../services/log')

module.exports.setupHandlers = ({ app, db }) => {
    const videosCollection = db.collection('videos');

    app.get('/', (req, res) => {
        res.send('Metadata service online');
    });

    app.get('/videos', (req, res) => {
        return videosCollection.find()
            .toArray()
            .then(videos => {
                res.json({
                    videos
                });
            })
            .catch(err => {
                logger.logError(err, 'Failed to get videos collection from database!');
                res.sendStatus(500);
            });
    });
};