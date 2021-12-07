require('dotenv').config();

const PORT = process.env.PORT && parseInt(process.env.PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;
const RABBIT = process.env.RABBIT;

if (!PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}

if (!DBHOST) {
    throw new Error('Please specify database address with the enviroment variable DBHOST.');
}
if (!DBNAME) {
    throw new Error('Please specify database name with the enviroment variable DBNAME.');
}

if (!RABBIT) {
    throw new Error('Please specify message broker address with the enviroment variable RABBIT.');
}

module.exports = {
    port: PORT,
    dbHost: DBHOST,
    dbName: DBNAME,
    rabbit: RABBIT
};