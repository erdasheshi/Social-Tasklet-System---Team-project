FROM ubuntu:16.04
LABEL maintainer "steffenschmitz@hotmail.de"

# Install nodejs
RUN apt-get update && \
  apt-get install -y curl && \
  curl -sL https://deb.nodesource.com/setup_6.x | bash - && \
  apt-get install -y nodejs nginx

# Create directory
RUN mkdir -p /usr/src/app

# Start only with package.json
COPY ./package.json /usr/src/app
WORKDIR /usr/src/app

RUN npm install --unsafe-perm node-sass
RUN npm install

# Copy and build rest of the app
COPY . /usr/src/app
RUN node_modules/@angular/cli/bin/ng build
RUN cp -a dist/. /var/www/html

RUN service nginx start

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
