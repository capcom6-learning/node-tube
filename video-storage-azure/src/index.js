const express = require('express');
const azure = require('azure-storage');
const mime = require('mime');

require('dotenv').config()

const app = express();

const PORT = process.env.PORT;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

function createBlobService() {
    const blobService = azure.createBlobService(STORAGE_ACCOUNT_NAME, STORAGE_ACCESS_KEY);
    return blobService;
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
    const blobService = createBlobService();
    const containerName = 'videos';

    // const rangeHeader = req.headers.range;
    // if (rangeHeader) {
    //     let [ rangeStart, rangeEnd ] = rangeHeader.replace(/bytes=/, '').split('-');
    //     rangeStart = parseInt(rangeStart, 10);
    //     rangeEnd = rangeEnd && parseInt(rangeEnd, 10);

    //     // console.log(rangeHeader);
    //     // matches = rangeHeader.match(/(\d+)-(\d+)?/);
    //     // rangeStart = parseInt(matches[1]);
    //     // rangeEnd = matches[2] && parseInt(matches[2]);
        
    // }

    // console.log(
    //     {rangeStart, rangeEnd}
    // );
    
    blobService.getBlobProperties(containerName, videoPath, (err, properties) => {
        if (err) {
            res.sendStatus(500);
            return;
        }

        contentType = properties.contentSettings.contentType || mime.getType(properties.name);

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
        blobService.getBlobToStream(
            containerName, 
            videoPath, 
            res, 
            range || {},
            err => {
                if (err) {
                    res.sendStatus(500);
                }
            }
        );
    });
});

app.listen(PORT, () => {
    console.log(`Microservice online on port ${PORT}`);
});
