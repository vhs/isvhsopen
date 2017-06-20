FROM node:5-slim

WORKDIR /usr/src/app

RUN echo 'deb http://ftp.debian.org/debian jessie-backports main' >> /etc/apt/sources.list

RUN apt-get -y update
RUN apt-get -y install certbot python-certbot

COPY package.json /usr/src/app/
RUN cd /usr/src/app && \
    echo "Installing dependancies, this may take a while" && \
    npm install
COPY . /usr/src/app
RUN node_modules/.bin/gulp build

ENV DEBUG=isvhsopen:*
ENV TZ=America/Vancouver
CMD [ "npm", "start" ]

EXPOSE 3001
