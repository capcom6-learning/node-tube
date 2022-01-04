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
     * @param {{ app: import("express").Express; metadata: import("../services/metadata"); streaming: import("../services/streaming"); }} service
     */
    constructor(service) {
        const app = service.app;

        this.getVideo = this.getVideo.bind(this);

        app.get('/api/video', this.getVideo);

        this.streaming = service.streaming;
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
}