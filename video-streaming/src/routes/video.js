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

module.exports = class VideoHandler {
    /**
     * @param {{ app: import("express").Express; channel: import('amqplib').Channel; history: import('../services/history'); metadata: import("../services/metadata"); storage: import("../services/storage"); }} microservice
     */
    constructor({ app, channel, history, metadata, storage}) {
        this.metadata = metadata;
        this.storage = storage;
        this.history = history;
        this.channel = channel;

        this.getVideo = this.getVideo.bind(this);

        app.get('/video', this.getVideo);
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getVideo(req, res) {
        if (!('id' in req.query) || !req.query.id) {
            res.sendStatus(400);
            return;
        }

        this.metadata.getVideo(String(req.query.id))
            .then(videoRecord => {
                if (!req.header('Range')) {
                    this.history.sendViewedMessage(this.channel, videoRecord.videoPath);
                }

                const forwardRequest = this.storage.makeGetRequest(
                    videoRecord.videoPath, 
                    req.headers, 
                    forwardResponse => {
                        res.writeHead(forwardResponse.statusCode, forwardResponse.headers);
                        forwardResponse.pipe(res);
                    });
            
                req.pipe(forwardRequest);
                forwardRequest.end();
            })
            .catch(err => {
                logger.logError(err, `Failed to get video by id ${req.query.id}`);
                res.sendStatus(500);
            });
    }
}