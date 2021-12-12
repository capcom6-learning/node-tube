FROM node:12 as dev

WORKDIR /usr/src/app

COPY .env .env
COPY package*.json ./

CMD npm config set cache-min 9999999 && \
    npm install && \
    npx wait-port rabbit:5672 \
    npm run start:dev


FROM node:12-alpine as prod

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --only=production

COPY ./src ./src

CMD npm start