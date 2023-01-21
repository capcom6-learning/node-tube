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

const { S3 } = require("@aws-sdk/client-s3");

module.exports = class Storage {
    /**
     * @param {{accessKeyId: string, secretAccessKey: string}} credentials
     * @param {{endpoint: string, region: string, bucketName: string, containerName: string}} storage
     */
    constructor(credentials, storage) {
        this.client = new S3({
            endpoint: storage.endpoint,
            region: storage.region,
            credentials: credentials,
        });
        this.bucketName = storage.bucketName;
        this.containerName = storage.containerName;
    }

    /**
     * @param {string} path
     */
    getProperties(path) {
        return this.client.getObject({
            Bucket: this.bucketName,
            Key: `${this.containerName}/${path}`,
        }).then(data => {
            const contentLength = data.ContentLength;
            if (contentLength === undefined) {
                throw new Error('Empty ContentLength header');
            }

            return {
                contentType: data.ContentType,
                contentLength: contentLength,
            };
        });
    }

    /**
     * @param {string} path
     * @param {number} offset
     * @param {number} count
     * @param {import("stream").Writable} stream
     */
    async downloadTo(path, offset, count, stream) {
        return this.client.getObject({
            Bucket: this.bucketName,
            Key: `${this.containerName}/${path}`,
            Range: `bytes=${offset}-${offset + count - 1}`,
        }).then(data => {
            const body = data.Body;
            if (!body) {
                throw new Error('Empty body');
            }

            // @ts-ignore
            return body.pipe(stream);
        });
    }

    /**
     * @param {string} path
     * @param {import("stream").Readable} stream
     */
    async uploadTo(path, contentType, stream) {
        return this.client.putObject({
            Bucket: this.bucketName,
            Key: `${this.containerName}/${path}`,
            ContentType: contentType,
            Body: stream
        })
            .then(resp => {
                console.log(resp);
                return resp;
            });
    }
}
