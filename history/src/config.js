require('dotenv').config();

const PORT = process.env.PORT && parseInt(process.env.PORT);

if (!PORT) {
    throw new Error('Please specify the port number for the HTTP server with the enviroment variable PORT.');
}

module.exports = {
    port: PORT
};