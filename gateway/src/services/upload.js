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

const axios = require('axios').default;

module.exports = class VideoUploading {
    /**
     * @param {string} uploadUrl
     */
    constructor(uploadUrl) {
        this.uploadUrl = uploadUrl;
    }

     /**
     * @param {string} filename
     * @param {string} contentType
     * @param {import('stream').Readable} stream
     */
     uploadVideo(filename, contentType, stream) {
        return axios.put(
            `${this.uploadUrl}/video`, 
            stream, 
            { 
                params: { filename }, 
                headers: { 'Content-Type': contentType },
                maxBodyLength: Infinity,
            }
        );

        // return new Promise((resolve, reject) => {
        //     const request = http.request({
        //         host: this.host,
        //         port: this.port,
        //         path: `/video?path=${path}`,
        //         method: 'PUT',
        //     }, (res) => {
        //         if (res.statusCode < 300) {
        //             resolve();
        //         } else {
        //             reject();
        //         }
        //     });

        //     stream.pipe(request);
        // });
    }
}