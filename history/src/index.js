const config = require('./config');

const express = require('express');
const bodyParser = require('body-parser')

const mongodb = require('mongodb');

const service = require('./api-routes')

function setupHandlers(app, db) {
    app.get('/', (req, res) => {
        res.send('Node History Service');
    });

    service.setupHandlers(app, db);
}

function startHttpServer(db) {
    return new Promise(resolve => {
        const app = express();

        // parse application/json
        app.use(bodyParser.json())

        setupHandlers(app, db);

        app.listen(config.port, () => {
            resolve();
        });
    });
}

function main() {
    return mongodb.MongoClient.connect(config.dbHost)
        .then(client => {
            const db = client.db(config.dbName);

            return startHttpServer(db);
        });
}

main()
    .then(() => {
        console.log(`History service online on port ${config.port}`);
    })
    .catch(err => {
        console.error(`History service failed to start on port ${config.port}`);
        console.error(err && err.stack || err);
    });