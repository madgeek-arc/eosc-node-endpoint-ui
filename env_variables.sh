#!/bin/bash

envsubst '${API_ENDPOINT}' < /etc/nginx/nginx.conf.tmpl > /etc/nginx/conf.d/default.conf &&

nginx -g "daemon off;"
