const express = require('express');
const bodyParser = require('body-parser')

const { setupHandlers } = require("../routes");

module.exports.startHttpServer = async (port, db) => {
    return new Promise(resolve => { // Wrap in a promise so we can be notified when the server has started.
        const app = express();
        app.use(bodyParser.json())

        const microservice = { // Create an object to represent our microservice.
            app,
            db: db.db,
        }
        setupHandlers(microservice);

        const server = app.listen(port, () => {
            microservice.close = async () => { // Create a function that can be used to close our server and database.
                await new Promise(resolve => {
                    server.close(() => {
                        resolve();
                    });
                });
                return db.close();
            };
            resolve(microservice);
        });
    });
};