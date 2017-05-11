FROM node:7.10.0

RUN mkdir /src
ADD ./ /src
WORKDIR /src
#ADD ./package.json /src/package.json
RUN npm install
RUN npm install -g nodemon

#EXPOSE 3000

#CMD node .
