const logger = require('../services/log')

module.exports.setupHandlers = (app, db, channel) => {
    const videosCollection = db.collection('videos');

    app.post('/viewed', (req, res) => {
        const videoPath = req.body.videoPath;

    });

    const consumeMessage = (msg) => {
        const parsedMsg = JSON.parse(msg.content.toString());

        console.log(`Received message ${parsedMsg.videoId}.`);

        channel.ack(msg);

        return Promise.resolve();
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