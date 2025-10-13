### Install and Build ###
FROM node:20 AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY . .
RUN npm run build:prod


### Create Container ###
FROM nginx:alpine

COPY nginx.conf /etc/nginx/nginx.conf.tmpl
COPY env_variables.sh /docker-entrypoint.d/99-env-subst.sh
COPY --from=build /usr/src/app/dist/*/browser /usr/share/nginx/html

RUN apk update && apk add bash


EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1:80/ || exit 1
