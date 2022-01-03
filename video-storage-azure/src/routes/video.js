//@ts-check

// Copyright 2022 Aleksandr Soloshenko
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const Storage = require('../services/storage');
const logger = require('../services/log');

const containerName = 'videos';

module.exports = class VideoHandler {
    /**
     * @param {{ app: import('express').Express; config: import('../config'); }} service
     */
    constructor(service) {
        const config = service.config;
        const app = service.app;

        this.storage = new Storage(config.storageAccountName, config.storageAccessKey, containerName);

        this.index = this.index.bind(this);
        this.getVideo = this.getVideo.bind(this);
        this.putVideo = this.putVideo.bind(this);

        app.get('/', this.index);
        app.get('/video', this.getVideo);
        app.put('/video', this.putVideo);
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    index(req, res) {
        res.send('Video storage service');
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getVideo(req, res) {
        const videoPath = req.query.path;
        if (!videoPath) {
            res.sendStatus(400);
            return;
        }
    
        this.storage.getProperties(videoPath.toString())
            .then((properties) => {
                const contentType = properties.contentType;
                const range = req.range(properties.contentLength);
    
                const headers = {
                    'Content-Length': properties.contentLength,
                    'Content-Type': contentType,
                    'Accept-Ranges': 'bytes'
                };
                
                if (range) {
                    const firstRange = range[0];

                    headers['Content-Length'] = firstRange.end - firstRange.start + 1;
                    headers['Content-Range'] = `bytes ${firstRange.start}-${firstRange.end}/${properties.contentLength}`;
                }
        
                res.writeHead(
                    range ? 206 : 200, 
                    headers
                );
    
                const offset = range ? range[0].start : 0;
                const count = range ? range[0].end - range[0].start + 1 : properties.contentLength;

                return this.storage.downloadTo(videoPath.toString(), offset, count, res);
            })
            .catch((err) => {
                logger.logError(err, `Failed to retrieve and send video for ${videoPath}`);
                res.sendStatus(500);
            });
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    putVideo(req, res) {
        const videoPath = req.query.path;
        if (!videoPath) {
            res.sendStatus(400);
            return;
        }

        this.storage.uploadTo(videoPath.toString(), req)
            .then(() => {
                res.sendStatus(201);
                return;
            })
            .catch((err) => {
                logger.logError(err, `Failed to upload video for ${videoPath}`);
                res.sendStatus(500);
                return;
            });
    }
}
