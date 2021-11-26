FROM node:12-alpine

WORKDIR /usr/src/app

COPY ./videos ./videos

COPY package*.json ./

RUN npm install --only=production

COPY ./src ./src

CMD npm start