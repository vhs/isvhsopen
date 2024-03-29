FROM node:lts

WORKDIR /usr/src/app

RUN apt-get -y update && apt -y upgrade

COPY package.json /usr/src/app/

RUN cd /usr/src/app && \
    echo "Installing dependencies, this may take a while" && \
    npm install

COPY . /usr/src/app

RUN node_modules/.bin/gulp build

ENV TZ=America/Vancouver

CMD [ "npm", "start" ]

EXPOSE 3000
