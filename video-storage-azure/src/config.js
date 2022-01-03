//@ts-check

require('dotenv').config();

if (!process.env.STORAGE_ACCOUNT_NAME) {
    throw new Error('Please specify the Azure storage account name with the enviroment variable STORAGE_ACCOUNT_NAME.');
}
if (!process.env.STORAGE_ACCESS_KEY) {
    throw new Error('Please specify the Azure storage access key with the enviroment variable STORAGE_ACCESS_KEY.');
}

const PORT = parseInt(process.env.PORT) || 80;
const STORAGE_ACCOUNT_NAME = process.env.STORAGE_ACCOUNT_NAME;
const STORAGE_ACCESS_KEY = process.env.STORAGE_ACCESS_KEY;

module.exports = {
    port: PORT,
    storageAccountName: STORAGE_ACCOUNT_NAME,
    storageAccessKey: STORAGE_ACCESS_KEY,
};