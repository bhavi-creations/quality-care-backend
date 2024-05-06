FROM node:16.19.1-alpine
WORKDIR /usr/src/app

ARG ENVIRONMENT='development'

COPY package*.json ./

RUN npm install

COPY . .

EXPOSE 80

CMD ["node", "src/server.js"]