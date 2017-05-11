FROM node:7.4.0

RUN mkdir /src

RUN npm install nodemon -g

WORKDIR /src
ADD ./package.json /src/package.json
RUN npm install

ADD ./nodemon.json /src/nodemon.json

EXPOSE 8888

CMD npm start
