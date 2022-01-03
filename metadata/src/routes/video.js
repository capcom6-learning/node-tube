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

const videos = require('../models/video');
const logger = require('../services/log');

const collectionName = 'videos';

module.exports = class VideoHandler {
    /**
     * @param {{ app: import('express').Express; db: import('mongodb').Db; }} microservice
     */
    constructor(microservice) {
        const app = microservice.app;
        const db = microservice.db;

        this.collection = db.collection(collectionName);

        this.selectVideo = this.selectVideo.bind(this);
        this.getVideo = this.getVideo.bind(this);
        this.putVideo = this.putVideo.bind(this);

        app.get('/video', this.selectVideo);
        app.put('/video', this.putVideo);
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    selectVideo(req, res) {
        if ('id' in req.query && req.query.id) {
            this.getVideo(req, res);
            return;
        }

        return videos.select(this.collection)
            .then(videos => {
                res.json({ videos });
            })
            .catch(err => {
                logger.logError(err, 'Failed to get videos collection from database!');
                res.sendStatus(500);
            });
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    getVideo(req, res) {
        return videos.getById(this.collection, String(req.query.id))
            .then(video => {
                if (!video) {
                    res.sendStatus(404);
                    return;
                }

                res.json(video);
            })
            .catch(err => {
                logger.logError(err, `Failed to get video by id ${req.params.id} from database!`)
                res.sendStatus(500);
            });
    }

    /**
     * @param {import('express').Request} req
     * @param {import('express').Response} res
     */
    putVideo(req, res) {
        const video = req.body;
        if (!video || !video.name || !video.videoPath) {
            res.sendStatus(400);
            return;
        }

        return videos.insert(this.collection, video)
            .then(_ => res.json(video))
            .catch(err => {
                res.sendStatus(500);
                logger.logError(err, 'Failed to insert video');
            });
    }
}