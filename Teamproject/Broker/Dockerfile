FROM node:6.10.3
LABEL maintainer "albrinkm@mail.uni-mannheim.de"

RUN mkdir -p /usr/src/app
COPY ./package.json /usr/src/app
WORKDIR /usr/src/app
RUN npm install
COPY . /usr/src/app
COPY ./config.json /usr/src

EXPOSE 18002
EXPOSE 18003
EXPOSE 18004

EXPOSE 34123
EXPOSE 63667
EXPOSE 49129

CMD ["node","server.js"]