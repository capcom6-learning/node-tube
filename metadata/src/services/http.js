const express = require('express');

const { setupHandlers } = require("../api-routes");

module.exports.startHttpServer = async (port, dbConn) => {
    return new Promise(resolve => { // Wrap in a promise so we can be notified when the server has started.
        const app = express();
        const microservice = { // Create an object to represent our microservice.
            app: app,
            db: dbConn.db,
        }
        setupHandlers(microservice);

        const server = app.listen(port, () => {
            microservice.close = async () => { // Create a function that can be used to close our server and database.
                await new Promise(resolve => {
                    server.close(() => {
                        resolve();
                    });
                });
                return dbConn.close();
            };
            resolve(microservice);
        });
    });
};