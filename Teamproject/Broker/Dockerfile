FROM node:6.10.3
LABEL maintainer "steffenschmitz@hotmail.de"

RUN mkdir -p /usr/src/app
COPY ./package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install
COPY . /usr/src/app
COPY ./config.json /usr/src

EXPOSE 8003

CMD ["node","server.js"]