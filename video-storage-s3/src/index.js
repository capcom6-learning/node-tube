//@ts-check

const express = require('express');

const VideoHandler = require('./routes/video');

function main() {
    const config = require('./config');

    const app = express();

    new VideoHandler({ app, config });

    app.listen(config.port, () => {
        console.log(`Video storage (S3) service is online on port ${config.port}`);
    });
}

main();
