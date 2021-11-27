const express = require('express');
const azure = require('azure-storage');
const mime = require('mime');

const app = express();

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

function createBlobService() {
    const blobService = azure.createBlobService(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    return blobService;
}

app.get('/video', (req, res) => {
    const videoPath = req.query.path;
    const blobService = createBlobService();
    const containerName = 'videos';
    
    blobService.getBlobProperties(containerName, videoPath, (err, properties) => {
        if (err) {
            res.sendStatus(500);
            return;
        }

        contentType = properties.contentSettings.contentType || mime.getType(properties.name);

        res.writeHead(
            200, 
            {
                'Content-Length': properties.contentLength,
                'Content-Type': contentType
            }
        );
        blobService.getBlobToStream(
            containerName, 
            videoPath, 
            res, 
            err => {
                if (err) {
                    res.sendStatus(500);
                }
            }
        );
    });
});

app.listen(PORT, () => {
    console.log('Microservice online');
});
