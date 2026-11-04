#!/bin/sh
set -eu

: "${ORIGIN_TOKEN:?ORIGIN_TOKEN must be set for the CloudFront origin check}"

envsubst '${ORIGIN_TOKEN}' \
  < /etc/nginx/templates/default.conf.template \
  > /etc/nginx/conf.d/default.conf

nginx -t
exec nginx -g 'daemon off;'
