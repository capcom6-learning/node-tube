//@ts-check

const logger = require('../services/log');
const videoModel = require('../repositories/video');

class HttpHandler {
    /**
     * @param {{ app: import("express").Express; db: import("mongodb").Db; }} service
     */
    constructor({ app, db }) {
        this.app = app;
        this.db = db;
        this.dbCollection = db.collection('videos');

        this.viewedPost = this.viewedPost.bind(this);
        this.viewedGet = this.viewedGet.bind(this);

        app.post('/viewed', this.viewedPost);
        app.get('/viewed', this.viewedGet);
    }

    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    viewedPost(req, res) {
        const videoPath = req.body.videoPath;
        videoModel.insert(this.dbCollection, videoPath)
            .then(() => {
                console.log(`Added video ${videoPath} to history.`);
                res.sendStatus(201);
            })
            .catch((err) => {
                logger.logError(err, `Error adding video ${videoPath} to history.`);
                res.sendStatus(500);
            });
    }
    
    /**
     * @param {import("express").Request} req
     * @param {import("express").Response} res
     */
    viewedGet(req, res) {
        videoModel.select(this.dbCollection)
            .then(data => res.json(data))
            .catch(err => {
                logger.logError(err, `Can not get viewed data.`);
                res.sendStatus(500)
            });
    }
}

module.exports.setupHandlers = (
    /** @type {import("express").Express} */ app, 
    /** @type {import("mongodb").Db} */ db, 
    /** @type {import("amqplib").Channel} */ channel) => {
    const videosCollection = db.collection('videos');

    new HttpHandler({ app, db });

    const consumeMessage = async (/** @type {import("amqplib").Message} */ msg) => {
        const parsedMsg = JSON.parse(msg.content.toString());
        await videoModel.insert(videosCollection, parsedMsg.videoPath);
        channel.ack(msg);
    };

    return channel.assertExchange('viewed', 'fanout')
        .then(() => {
            return channel.assertQueue('', { exclusive: true });
        })
        .then((response) => {
            const queueName = response.queue;
            return channel.bindQueue(queueName, 'viewed', '')
                .then(() => {
                    return channel.consume(queueName, consumeMessage);
                });
        });
};