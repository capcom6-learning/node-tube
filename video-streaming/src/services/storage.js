//@ts-check

const http = require('http');

module.exports = class StorageService {
    /**
     * @param {string} host
     * @param {number} port
     */
    constructor(host, port) {
        this.host = host;
        this.port = port;
    }

    /**
     * @param {string} path
     * @param {any} headers
     * @param {(res: http.IncomingMessage) => void} callback
     */
    makeGetRequest(path, headers, callback) {
        return http.request({
            host: this.host,
            port: this.port,
            path: `/video?path=${path}`,
            method: 'GET',
            headers: headers
        }, callback);
    }

    /**
     * @param {string} path
     * @param {import('stream').Readable} stream
     */
    uploadVideo(path, stream) {
        return new Promise((resolve, reject) => {
            const request = http.request({
                host: this.host,
                port: this.port,
                path: `/video?path=${path}`,
                method: 'PUT',
            }, (res) => {
                if (res.statusCode < 300) {
                    resolve();
                } else {
                    reject();
                }
            });

            stream.pipe(request);
        });
    }
}