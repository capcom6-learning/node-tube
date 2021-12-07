const logger = require('../services/log')

module.exports.setupHandlers = (app, db, channel) => {
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

    const consumeMessage = (msg) => {
        const parsedMsg = JSON.parse(msg.content.toString());
        return videosCollection.insertOne({ videoPath: parsedMsg.videoPath })
            .then(() => {
                channel.ack(msg);
            });
    };

    return channel.assertExchange('viewed', 'fanout')
        .then(() => {
            return channel.assertQueue('', { exclusive: true });
        })
        .then(response => {
            const queueName = response.queue;
            return channel.bindQueue(queueName, 'viewed', '')
                .then(() => {
                    return channel.consume(queueName, consumeMessage);
                });
        });
};