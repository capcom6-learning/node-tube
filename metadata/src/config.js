require('dotenv').config();

const PORT = process.env.PORT && parseInt(process.env.PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

if (!PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}

if (!DBHOST) {
    throw new Error('Please specify database address with the enviroment variable DBHOST.');
}
if (!DBNAME) {
    throw new Error('Please specify database name with the enviroment variable DBNAME.');
}

module.exports = {
    port: PORT,
    dbHost: DBHOST,
    dbName: DBNAME,
};