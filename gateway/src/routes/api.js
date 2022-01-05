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

const logger = require('../services/log');

module.exports = class ApiHandler {
    /**
     * @param {{ app: import("express").Express; metadata: import("../services/metadata"); streaming: import("../services/streaming"); uploading: import("../services/upload"); }} service
     */
    constructor(service) {
        const app = service.app;

        this.getVideo = this.getVideo.bind(this);
        this.uploadVideo = this.uploadVideo.bind(this);

        app.get('/api/video', this.getVideo);
        app.post('/api/upload', this.uploadVideo);

        this.streaming = service.streaming;
        this.uploading = service.uploading;
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getVideo(req, res) {
        const id = req.query.id || '';
        if (!id) {
            res.sendStatus(400);
            return;
        }

        this.streaming.getVideo(req.headers, id.toString())
            .then(response => {
                res.writeHead(response.status, response.headers);
                response.data.pipe(res);
            })
            .catch(err => {
                logger.logError(err, `Can not get video with id ${id}`);
                res.sendStatus(500);
            });
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    uploadVideo(req, res) {
        const fileName = req.header('file-name');
        if (!fileName) {
            res.sendStatus(400);
            return;
        }

        this.uploading.uploadVideo(fileName.toString(), req.header('content-type').toString(), req)
            .then(response => {
                res.sendStatus(201);
            })
            .catch(err => {
                logger.logError(err, `Can not upload video with name ${fileName}`);
                res.sendStatus(500);
            });
    }
}