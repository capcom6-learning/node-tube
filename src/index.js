const path = require('path');

const express = require('express');
const fs = require('fs');
const app = express();

if (!process.env.PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}

const PORT = process.env.PORT;

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.get('/video', (req, res) => {
    const filename = path.join(__dirname, '../videos/SampleVideo_1280x720_30mb.mp4');
    res.sendFile(filename);
    // fs.stat(path, (err, stats) => {
    //     if (err) {
    //         console.error('An error occured');
    //         res.sendStatus(500);
    //         return;
    //     }

    //     res.writeHead(200, { 'Content-Length': stats.size, 'Content-Type': 'video/mp4' });

    //     fs.createReadStream(path).pipe(res);
    // });
});

app.listen(PORT, () => {
    console.log(`Example app listeting on port ${PORT}!`);
});
