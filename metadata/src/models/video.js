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

const insert = async (/** @type {mongodb.Collection} */ collection, /** @type {{ name: string, videoPath: string }} */ video) => {
    const result = await collection.insertOne(video);
    return result.insertedId;
};

module.exports = {
    select,
    getById,
    insert,
};