//@ts-check

require('dotenv').config();

const RABBIT = process.env.RABBIT;

if (!process.env.PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}
if (!process.env.VIDEO_STORAGE_HOST) {
    throw new Error('Please specify video storage address with the enviroment variable VIDEO_STORAGE_HOST.');
}
if (!process.env.VIDEO_STORAGE_PORT) {
    throw new Error('Please specify video storage port with the enviroment variable VIDEO_STORAGE_PORT.');
}
if (!process.env.METADATA_HOST) {
    throw new Error('Please specify metadata service address with the enviroment variable METADATA_HOST.');
}
if (!process.env.METADATA_PORT || !parseInt(process.env.METADATA_PORT)) {
    throw new Error('Please specify metadata service port with the enviroment variable METADATA_PORT.');
}
if (!RABBIT) {
    throw new Error('Please specify RabbitMQ address with the enviroment variable RABBIT.');
}

const PORT = process.env.PORT;
const VIDEO_STORAGE_HOST = process.env.VIDEO_STORAGE_HOST;
const VIDEO_STORAGE_PORT = parseInt(process.env.VIDEO_STORAGE_PORT);
const METADATA_HOST = process.env.METADATA_HOST;
const METADATA_PORT = parseInt(process.env.METADATA_PORT);

module.exports = {
    port: parseInt(PORT),
    videoStorageHost: VIDEO_STORAGE_HOST,
    videoStoragePort: VIDEO_STORAGE_PORT,
    rabbit: RABBIT,
    metadataHost: METADATA_HOST,
    metadataPort: METADATA_PORT,
};