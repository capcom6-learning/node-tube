FROM node:18 as dev

WORKDIR /usr/src/app

COPY package*.json ./

CMD npm config set cache-min 9999999 && \
    npm install && \
    npm run start:dev


FROM node:18-alpine as prod

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY ./src ./src

CMD npm start