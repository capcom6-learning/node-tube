require('dotenv').config();

if (!process.env.PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}
if (!process.env.VIDEO_STORAGE_HOST) {
    throw new Error('Please specify video storage address with the enviroment variable VIDEO_STORAGE_HOST.');
}
if (!process.env.VIDEO_STORAGE_PORT) {
    throw new Error('Please specify video storage port with the enviroment variable VIDEO_STORAGE_PORT.');
}
if (!process.env.DBHOST) {
    throw new Error('Please specify database address with the enviroment variable DBHOST.');
}
if (!process.env.DBNAME) {
    throw new Error('Please specify database name with the enviroment variable DBNAME.');
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const DBHOST = process.env.DBHOST;
const DBNAME = process.env.DBNAME;

module.exports = {
    port: PORT,
    videoStorageHost: VIDEO_STORAGE_HOST,
    videoStoragePort: VIDEO_STORAGE_PORT,
    dbhost: DBHOST,
    dbname: DBNAME
};