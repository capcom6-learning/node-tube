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
const path = require('path');
const mime = require('mime/lite');
const nanoid = require('nanoid');

module.exports = class VideoHandler {
    /**
     * @param {{ app: import("express").Express; messaging: import("../services/messaging"); metadata: import("../services/metadata"); storage: import("../services/storage"); }} microservice
     */
    constructor({ app, messaging, metadata, storage}) {
        this.metadata = metadata;
        this.storage = storage;
        this.messaging = messaging;

        this.putVideo = this.putVideo.bind(this);

        app.put('/video', this.putVideo);
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    putVideo(req, res) {
        if (!('filename' in req.query)) {
            res.sendStatus(400);
            return;
        }

        const sourceFilename = req.query.filename.toString();
        const name = (req.query.name || sourceFilename).toString();

        if (!sourceFilename) {
            res.sendStatus(400);
            return;
        }

        const extension = path.extname(sourceFilename);
        const mimeType = mime.getType(sourceFilename);
        if (!mimeType.startsWith('video')) {
            res.sendStatus(400);
            return;
        }

        const videoPath = nanoid.nanoid() + extension;

        this.storage.uploadVideo(videoPath, req)
            .then(() => {
                return this.metadata.putVideo({ name, videoPath });
            })
            .then(metadata => {
                this.messaging.videoUploaded(metadata);
                res.sendStatus(201);
            })
            .catch(err => {
                logger.logError(err, `Failed to upload video to ${videoPath}`);
                res.sendStatus(500);
            });

        
    }
}