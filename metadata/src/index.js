const db = require('./models/db');
const httpServer = require('./services/http');

const config = require('./config');
const logger = require('./services/log');

async function startMicroservice(config) {
    return db.connectDb(config.dbHost, config.dbName)            // Connect to the database...
        .then(dbConn => {                       // then...
            return httpServer.startHttpServer(config.port, dbConn);     // start the HTTP server.
        });
}

async function main() {
    return startMicroservice(config);
}

if (require.main === module) {
    // Only start the microservice normally if this script is the "main" module.
    main()
        .then(() => console.log(`Metadata microservice online on port ${config.port}.`))
        .catch(err => {
            logger.logError(err, 'Metadata service failed to start.');
        });
}
else {
    // Otherwise we are running under test
    module.exports = {
        startMicroservice,
    };
}