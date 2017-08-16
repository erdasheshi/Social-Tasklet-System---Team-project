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

RUN mkdir -p node_modules/node-sass/vendor/linux-x64-51
RUN curl -L https://github.com/sass/node-sass/releases/download/v4.5.3/linux-x64-51_binding.node -o node_modules/node-sass/vendor/linux-x64-51/binding.node

RUN npm install
RUN npm rebuild node-sass

# Copy and build rest of the app
COPY . /usr/src/app
RUN node_modules/@angular/cli/bin/ng build
RUN cp -a dist/. /var/www/html

RUN service nginx start

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
