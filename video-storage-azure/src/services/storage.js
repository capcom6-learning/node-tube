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

const { BlobServiceClient, StorageSharedKeyCredential } = require("@azure/storage-blob");

module.exports = class Storage {
    /**
     * @param {string} accountName
     * @param {string} storageKey
     * @param {string} containerName
     */
    constructor(accountName, storageKey, containerName) {
        // this.accountName = accountName;
        // this.storageKey = storageKey;
        // this.containerName = containerName;

        const sharedKeyCredential = new StorageSharedKeyCredential(accountName, storageKey);
        this.client = new BlobServiceClient(
            `https://${accountName}.blob.core.windows.net`,
            sharedKeyCredential
        );
        this.containerClient = this.client.getContainerClient(containerName);
    }

    /**
     * @param {string} path
     */
    getProperties(path) {
        return this.containerClient
            .getBlobClient(path)
            .getProperties();
    }

    /**
     * @param {string} path
     * @param {number} offset
     * @param {number} count
     * @param {import("stream").Writable} stream
     */
    async downloadTo(path, offset, count, stream) {
        const blob = await this.containerClient
            .getBlobClient(path)
            .download(offset, count);
        return blob.readableStreamBody.pipe(stream);
    }

    /**
     * @param {string} path
     * @param {import("stream").Readable} stream
     */
    async uploadTo(path, stream) {
        return this.containerClient
            .getBlockBlobClient(path)
            .uploadStream(stream);
    }
}
