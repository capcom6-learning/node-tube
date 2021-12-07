const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser')

const mongodb = require('mongodb');
const amqp = require('amqplib');

const service = require('./api-routes')

function setupHandlers(app, db, channel) {
    app.get('/', (req, res) => {
        res.send('Node Recommendations Service');
    });

    service.setupHandlers(app, db, channel);
}

function startHttpServer(db, channel) {
    return new Promise(resolve => {
        const app = express();

        // parse application/json
        app.use(bodyParser.json())

        setupHandlers(app, db, channel);

        app.listen(config.port, () => {
            resolve();
        });
    });
}

function connectRabbit() {
    return amqp.connect(config.rabbit)
        .then(connection => {
            return connection.createChannel();
        });
}

function connectDb() {
    return mongodb.MongoClient.connect(config.dbHost)
        .then(client => {
            return client.db(config.dbName);
        });
}

function main() {
    return connectDb()
        .then(db => {
            return connectRabbit()
            .then(channel => {
                return startHttpServer(db, channel);
            })
        });
}

main()
    .then(() => {
        console.log(`Recommendations service online on port ${config.port}`);
    })
    .catch(err => {
        console.error(`Recommendations service failed to start on port ${config.port}`);
        console.error(err && err.stack || err);
    });