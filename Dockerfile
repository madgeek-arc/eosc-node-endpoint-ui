### Install and Build ###
FROM node:20 AS build

WORKDIR /usr/src/app

COPY package.json ./
COPY package-lock.json ./

RUN npm ci
COPY . .
ARG configuration=prod
RUN npm run build:$configuration -- --base-href %APP_BASE_HREF%


### Create Container ###
FROM nginx:alpine

COPY docker/nginx/nginx.conf /etc/nginx/conf.d/default.conf
COPY docker/docker-entrypoint.d/ /docker-entrypoint.d/
COPY --from=build /usr/src/app/dist/*/browser /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK CMD wget -qO- http://127.0.0.1:80/ || exit 1
