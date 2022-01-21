FROM node:alpine

#RUN apk add vips-dev fftw-dev --update-cache --repository https://dl-3.alpinelinux.org/alpine/edge/testing/

WORKDIR /usr/src/app
COPY package.json ./

RUN npm install

COPY . .

CMD [ "npm", "start" ]