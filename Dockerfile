FROM node:7.10.0

RUN mkdir /src
ADD ./ /src
WORKDIR /src
RUN npm install
RUN npm install -g nodemon
