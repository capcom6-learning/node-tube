//@ts-check

require('dotenv').config();

if (!process.env.PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}
if (!process.env.METADATA_HOST) {
    throw new Error('Please specify metadata service address with the enviroment variable METADATA_HOST.');
}
if (!process.env.METADATA_PORT || !parseInt(process.env.METADATA_PORT)) {
    throw new Error('Please specify metadata service port with the enviroment variable METADATA_PORT.');
}

const PORT = process.env.PORT;
const METADATA_HOST = process.env.METADATA_HOST;
const METADATA_PORT = parseInt(process.env.METADATA_PORT);

module.exports = {
    port: PORT,
    metadataHost: METADATA_HOST,
    metadataPort: METADATA_PORT,
};