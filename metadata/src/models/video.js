//@ts-check

const mongodb = require('mongodb');

const select = (/** @type {mongodb.Collection} */ collection) => {
    return collection.find()
            .toArray();
};

const getById = (/** @type {mongodb.Collection} */ collection, /** @type {string} */ id) => {
    try {
        const videoId = new mongodb.ObjectId(id);

        return collection.findOne({ _id: videoId });
    } catch (error) {
        return Promise.reject(error);
    }
};

module.exports = {
    select,
    getById,
};