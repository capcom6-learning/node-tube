//@ts-check

require('dotenv').config();

const PORT = parseInt(process.env.PORT || '80');

module.exports = {
    port: PORT,
    storage: {
        endpoint: process.env.STORAGE__ENDPOINT || '',
        region: process.env.STORAGE__REGION || '',
        bucketName: process.env.STORAGE__BUCKET_NAME || '',
        containerName: process.env.STORAGE__CONTAINER_NAME || '',
        credentials: {
            accessKeyId: process.env.STORAGE__CREDENTIALS__ACCESS_KEY_ID || '',
            secretAccessKey: process.env.STORAGE__CREDENTIALS__SECRET_ACCESS_KEY || '',
        },
    },
};