FROM node:5-slim

WORKDIR /usr/src/app

COPY package.json /usr/src/app/
RUN cd /usr/src/app && \
    echo "Installing dependancies, this may take a while" && \
    npm install
COPY . /usr/src/app
RUN node_modules/.bin/gulp build

ENV DEBUG=isvhsopen:*
CMD [ "npm", "start" ]

EXPOSE 3001
