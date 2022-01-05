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
if (!process.env.VIDEO_STREAMING_URL) {
    throw new Error('Please specify video streaming service address with the enviroment variable VIDEO_STREAMING_URL.');
}
if (!process.env.VIDEO_UPLOADING_URL) {
    throw new Error('Please specify video upload service address with the enviroment variable VIDEO_UPLOADING_URL.');
}

const PORT = parseInt(process.env.PORT || '80');
const METADATA_HOST = process.env.METADATA_HOST;
const METADATA_PORT = parseInt(process.env.METADATA_PORT);
const VIDEO_STREAMING_URL = process.env.VIDEO_STREAMING_URL;

module.exports = {
    port: PORT,
    metadataHost: METADATA_HOST,
    metadataPort: METADATA_PORT,
    videoStreamingUrl: VIDEO_STREAMING_URL,
    videoUploadUrl: process.env.VIDEO_UPLOADING_URL,
};