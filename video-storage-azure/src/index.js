const express = require('express');
const { BlobServiceClient, StorageSharedKeyCredential, BlobClient } = require("@azure/storage-blob");

require('dotenv').config()

const app = express();

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

if (!process.env.PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}
if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error('Please specify the Azure storage account name with the enviroment variable STORAGE_ACCOUNT_NAME.');
}
if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error('Please specify the Azure storage access key with the enviroment variable STORAGE_ACCESS_KEY.');
}

function createBlobServiceClient() {
    const sharedKeyCredential = new StorageSharedKeyCredential(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    return new BlobServiceClient(
        `https://${STORAGE_ACCOUNT_NAME}.blob.core.windows.net`,
        sharedKeyCredential
    );
}

function parseRangeHeader(range) {
    if (!range) {
        return null;
    }

    let [ rangeStart, rangeEnd ] = range.replace(/bytes=/, '').split('-');
    rangeStart = parseInt(rangeStart, 10);
    rangeEnd = rangeEnd && parseInt(rangeEnd, 10);

    return { rangeStart, rangeEnd };
}

app.get('/video', (req, res) => {
    const videoPath = req.query.path;
    const blobServiceClient = createBlobServiceClient();
    const containerName = 'videos';

    const internalErrorFn = () => {
        res.sendStatus(500);
        return;
    };

    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blobClient = containerClient.getBlobClient(videoPath);
    blobClient.getProperties()
        .then((properties) => {
            const contentType = properties.contentType;
            const range = parseRangeHeader(req.headers.range);

            const headers = {
                'Content-Length': properties.contentLength,
                'Content-Type': contentType,
                'Accept-Ranges': 'bytes'
            };
            
            if (range) {
                range.rangeStart = range.rangeStart || 0;
                range.rangeEnd = range.rangeEnd || (properties.contentLength - 1);
    
                headers['Content-Length'] = range.rangeEnd - range.rangeStart + 1;
                headers['Content-Range'] = `bytes ${range.rangeStart}-${range.rangeEnd}/${properties.contentLength}`;
            }
    
            res.writeHead(
                range ? 206 : 200, 
                headers
            );

            const offset = range ? range.rangeStart : 0;
            const count = range ? range.rangeEnd - range.rangeStart + 1 : properties.contentLength;
            return blobClient.download(offset, count);
        })
        .then((downloader) => {
            downloader.readableStreamBody.pipe(res);
        })
        .catch(internalErrorFn);
});

app.listen(PORT, () => {
    console.log(`Video storage (Azure) service is online on port ${PORT}`);
});
