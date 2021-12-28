//@ts-check

const axios = require('axios').default;

module.exports = class MetadataService {

    constructor(/** @type {string} */ host, /** @type {number} */ port) {
        this.baseUrl = `http://${host}:${port}`;
    }

    async selectVideo() {
        const response = await axios.get(`${this.baseUrl}/video`);
        return response.data;
    }

    async getVideo(/** @type {string} */ id) {
        const response = await axios.get(`${this.baseUrl}/video`, { params: { id } });
        return response.data;
    }
}