const mongodb = require('mongodb');

module.exports.connectDb = async (dbHost, dbName) => {
    return mongodb.MongoClient.connect(dbHost, { useUnifiedTopology: true }) 
        .then(client => {
            const db = client.db(dbName);
            return {                // Return an object that represents the database connection.
                db: db,             // To access the database...
                close: () => {      // and later close the connection to it.
                    return client.close();
                },
            };
        });
};
